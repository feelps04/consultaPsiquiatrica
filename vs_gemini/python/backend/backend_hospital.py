# Importa as bibliotecas necessárias
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
import uuid # Para gerar IDs de sessão básicos (para demonstração)

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configurar a API KEY a partir da variável de ambiente
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Erro: A variável de ambiente GOOGLE_API_KEY não está definida.")
    print("Por favor, crie um arquivo .env na mesma pasta com GOOGLE_API_KEY='SUA_CHAVE_AQUI'")
    genai_model = None
else:
    try:
        genai.configure(api_key=api_key)
        # Inicializa o modelo Gemini
        # Escolha o modelo apropriado (ex: 'gemini-1.5-flash', 'gemini-1.5-pro')
        # Definimos uma instrução de sistema detalhada para guiar o comportamento da IA
        # Instrução atualizada para ser mais explícita sobre a continuação do chat imediatamente após a recomendação e o encerramento baseado no comando do paciente.
        genai_model = genai.GenerativeModel(
            'gemini-1.5-flash',
            system_instruction=(
                "Você é inicialmente uma enfermeira de triagem de um hospital psiquiátrico, "
                "representada pela Google IA. Sua função é conduzir uma entrevista inicial com o paciente "
                "para coletar informações e determinar o especialista em psicologia mais apropriado "
                "para o encaminhamento. Faça perguntas sobre os seguintes tópicos: "
                "histórico familiar de saúde mental, histórico de saúde geral (incluindo condições físicas relevantes), "
                "uso atual ou passado de substâncias (alcool, drogas ilícitas, medicamentos prescritos ou de venda livre), "
                "queixas atuais (o que o trouxe ao hospital hoje), sintomas (físicos como dores, fadiga, ou mentais como ansiedade, tristeza, dificuldade de concentração), "
                "pensamentos e sentimentos (humor, preocupações, medos, esperanças), "
                "comportamento recente (mudanças no sono, apetite, nível de atividade, interações sociais), "
                "função cognitiva (problemas de memória, atenção, tomada de decisão) "
                "e nível de funcionamento social (dificuldades no trabalho, escola, relacionamentos). "
                "Mantenha suas respostas curtas e diretas durante a triagem. "
                "Faça apenas UMA pergunta por vez durante a triagem. "
                "Seja clara, empática e profissional. "
                "Com base nas respostas do paciente, determine qual dos seguintes especialistas é o mais adequado: "
                "Psicologia Clínica (ansiedade, depressão, transtornos de humor, problemas de relacionamento), "
                "Psicologia Organizacional (problemas no trabalho, carreira, stress profissional), "
                "Psicologia Escolar e Educacional (dificuldades de aprendizagem, comportamento escolar, orientação vocacional), "
                "Neuropsicologia (memória, atenção, funções cognitivas, lesões cerebrais), "
                "Psicologia Social (interação social, problemas em grupo, questões comunitárias), "
                "Psicologia do Esporte (desempenho de atletas, stress competitivo, motivação no desporto). "
                "Após sentir que tem informações suficientes para a triagem, finalize esta fase com uma breve saudação e apresente a recomendação do especialista no seguinte formato EXATO: "
                "'Recomendação de Especialista: [Nome da Área de Especialista] ([Gênero do Especialista])'. "
                "Use 'Masculino' ou 'Feminino' para o gênero. "
                "**IMEDIATAMENTE APÓS a linha de recomendação, SEM PAUSA ou espera por nova entrada do usuário, comece a falar como o especialista recomendado. Sua persona muda completamente. Apresente-se brevemente como o especialista (ex: 'Olá, sou o Dr./Dra. [Nome da Área]. A Enfermeira Jane me passou seu caso...') e faça uma pergunta para iniciar a consulta, aprofundando o caso com base no que foi discutido na triagem. Mantenha suas respostas MUITO curtas e diretas também como especialista. Seja o mais conciso possível.** Mantenha um tone profissional e empático como psicólogo. No final da consulta com o especialista, após entender bem o paciente e se apropriado para o caso, você pode sugerir opções de remédios naturais ou práticas de bem-estar como complemento ao tratamento. Use frases claras ao sugerir opções naturais, como 'Para ajudar com [sintoma específico], recomendo considerar opções naturais como [exemplo de remédio natural ou prática]...' ou 'Com base no que discutimos, sugiro algumas práticas naturais para complementar seu bem-estar, como [exemplo]...'. " # Instrução para a fase do psicólogo e remédios naturais, com ênfase na continuação imediata, apresentação E respostas MUITO curtas
                "A conversa deve continuar com o especialista até que o paciente indique que quer 'sair' ou 'terminar'. **APENAS e SOMENTE QUANDO o paciente indicar explicitamente que deseja sair (por exemplo, digitando 'fim', 'sair', 'encerrar', 'tchau'), responda de forma amigável indicando que a interação foi concluída e finalize SUA ÚLTIMA MENSAGEM com a frase exata 'Chat finalizado.' NUNCA use 'Chat finalizado.' em qualquer outra situação.** O frontend controlará o fechamento da interface de chat com base na interação do usuário." # Condição de fim de chat ajustada para ser EXTREMAMENTE explícita sobre o comando do paciente, incluindo 'tchau' e mencionando controle do frontend
            )
        )
        print("Modelo Gemini-1.5-flash carregado com sucesso com instrução de sistema para triagem/consulta.")
    except Exception as e:
        print(f"Erro ao configurar a API ou carregar o modelo Gemini: {e}")
        genai_model = None

# Inicializa a aplicação Flask
app = Flask(__name__)
# Habilita CORS para permitir requisições do frontend
CORS(app)

# --- Gerenciamento básico de sessão de chat (para demonstração) ---
# Em uma aplicação real com múltiplos usuários, você precisaria de um sistema
# de gerenciamento de sessão mais robusto (ex: Flask-Session, banco de dados)
# associado a um identificador de usuário.
# Para esta demonstração simples, usaremos um dicionário em memória.
# Isso funcionará para um único usuário por vez ou para testes locais.
# Se múltiplos usuários acessarem simultaneamente, as conversas podem se misturar.
chat_sessions = {}

# Rota para iniciar uma nova sessão de chat
@app.route('/start_chat_session', methods=['GET'])
def start_chat_session():
    """
    Endpoint para iniciar uma nova sessão de chat e obter o ID da sessão.
    """
    session_id = str(uuid.uuid4()) # Gera um ID único para a sessão
    # Inicializa o histórico de chat para esta sessão
    # O histórico deve começar com a instrução de sistema e a primeira mensagem da IA
    # Não precisamos adicionar a instrução de sistema ao histórico explicitamente aqui,
    # pois ela é configurada no modelo na inicialização.
    chat_sessions[session_id] = genai_model.start_chat(history=[]) # Inicia um novo chat com o modelo

    # Envia um prompt inicial para a IA para que ela comece a entrevista
    try:
        # O prompt inicial foi ajustado para pedir a primeira pergunta de forma concisa
        initial_prompt_to_ai = "Inicie a entrevista de triagem. Qual a primeira pergunta?"
        # Enviamos o prompt inicial para o modelo para obter a primeira resposta
        response = chat_sessions[session_id].send_message(initial_prompt_to_ai)
        initial_ai_message = response.text
        print(f"Sessão {session_id} iniciada. Primeira mensagem da IA: '{initial_ai_message}'")
        return jsonify({"session_id": session_id, "initial_message": initial_ai_message})
    except Exception as e:
        print(f"Erro ao iniciar chat session {session_id} ou obter primeira mensagem: {e}")
        del chat_sessions[session_id] # Limpa a sessão em caso de erro
        return jsonify({"error": "Não foi possível iniciar a sessão de chat com a IA."}), 500


# Define a rota para o chat
@app.route('/chat', methods=['POST'])
def chat():
    """
    Endpoint para receber mensagens do frontend e interagir com a IA.
    Requer 'session_id' e 'message' no corpo da requisição.
    """
    # Verifica se o modelo de IA foi carregado
    if genai_model is None:
        print("Erro: Tentativa de usar a IA, mas o modelo não foi carregado.")
        return jsonify({"error": "O serviço de IA não está disponível."}), 503 # Service Unavailable

    # Obtém os dados da requisição (espera um JSON com 'session_id' e 'message')
    data = request.get_json()
    if not data or 'session_id' not in data or 'message' not in data:
        # Retorna um erro se a requisição não contiver os dados necessários
        return jsonify({"error": "Requisição inválida. Espera-se um objeto JSON com as chaves 'session_id' e 'message'."}), 400 # Bad Request

    session_id = data['session_id']
    user_message = data['message']

    # Verifica se a sessão existe
    if session_id not in chat_sessions:
        print(f"Erro: Sessão {session_id} não encontrada.")
        return jsonify({"error": "Sessão de chat inválida ou expirada."}), 404 # Not Found

    print(f"Mensagem recebida para sessão {session_id}: '{user_message}'") # Log da mensagem recebida

    try:
        # Envia a mensagem do usuário para o modelo Gemini usando a sessão de chat
        # Isso mantém o contexto da conversa anterior
        chat_session = chat_sessions[session_id]
        response = chat_session.send_message(user_message)

        # Retorna a resposta da IA em formato JSON
        # response.text contém o texto gerado pela IA
        ai_response_text = response.text
        print(f"Resposta da IA gerada para sessão {session_id}: '{ai_response_text}'") # Log da resposta da IA

        # --- Lógica de encerramento da sessão ---
        # A sessão só será encerrada no backend se a IA usar a frase exata "Chat finalizado."
        # O frontend controlará o fechamento da interface de chat.
        if ai_response_text.strip().lower() == "chat finalizado.":
             print(f"Sessão {session_id} encerrada por indicação da IA.")
             del chat_sessions[session_id]
        # --- Fim da lógica de encerramento da sessão ---


        return jsonify({"reply": ai_response_text})

    except Exception as e:
        # Captura e loga quaisquer erros durante a geração da resposta da IA
        print(f"Erro ao gerar conteúdo com a IA para sessão {session_id}: {e}")
        # Retorna uma mensagem de erro para o frontend
        return jsonify({"error": "Desculpe, houve um erro ao processar sua solicitação de chat."}), 500 # Internal Server Error

# Rota de exemplo para verificar se o backend está funcionando
@app.route('/')
def index():
    return "Backend do Hospital Psiquiátrico está rodando!"

# Inicia o servidor Flask
if __name__ == '__main__':
    # Executa a aplicação em modo de debug (útil para desenvolvimento)
    # Em produção, desative o debug e use um servidor WSGI como Gunicorn ou uWSGI.
    app.run(debug=True, port=5000) # Roda na porta 5000 por padrão
