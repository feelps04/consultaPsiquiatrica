Simulação de Entrada em Hospital Psiquiátrico com Google IA
Este projeto é uma simulação interativa que permite ao utilizador personalizar um avatar e vivenciar a experiência de entrada num hospital psiquiátrico, incluindo uma triagem inicial e uma consulta com um especialista (representados por uma Google IA).

Funcionalidades
Personalização de Avatar: Escolha o género (Homem/Mulher) e a cor da pele (Branco/Preto) para personalizar o seu personagem.

Simulação Visual: Uma pequena animação 2D que representa a jornada do personagem até à entrada do hospital e o encontro com a enfermeira de triagem.

Triagem com IA: Interaja com uma Google IA que atua como enfermeira de triagem, fazendo perguntas para entender a sua situação.

Encaminhamento para Especialista: Com base na triagem, a IA recomenda um especialista em psicologia (com avatar e título atualizados no chat).

Consulta com Especialista (IA): Continue a conversa com a Google IA, que agora assume a persona do especialista recomendado, aprofundando a discussão sobre os seus sintomas e questões.

Sugestão de Remédios Naturais: O especialista pode sugerir opções de remédios naturais ou práticas de bem-estar, se apropriado para o caso discutido.

Controlo de Fecho do Chat: O chatbox só fecha quando o utilizador clica no botão 'X' no canto superior direito, garantindo que a consulta não termina inesperadamente.

Tecnologias Utilizadas
Frontend:

HTML5 (Estrutura)

CSS3 (Estilização)

JavaScript (Lógica da simulação, interação com o backend, manipulação do DOM)

Backend:

Python3 (Lógica do servidor)

Flask (Microframework web para criar a API)

Google Generative AI SDK (Para interagir com o modelo Gemini)

python-dotenv (Para carregar a API Key de um ficheiro .env)

Configuração do Projeto
Para configurar e executar este projeto localmente, siga os passos abaixo:

Pré-requisitos
Python 3.6 ou superior instalado.

Pip (gerenciador de pacotes do Python).

Uma chave de API da Google Cloud para usar o Google Generative AI.

Passos de Configuração
Clone o Repositório:

git clone <URL_DO_SEU_REPOSITORIO>
cd <PASTA_DO_SEU_REPOSITORIO>

Crie um Ambiente Virtual (Recomendado):

python -m venv venv
# No Windows
venv\Scripts\activate
# No macOS/Linux
source venv/bin/activate

Instale as Dependências do Backend:

pip install Flask Flask-Cors google-generativeai python-dotenv uuid

Configure a Chave de API da Google:

Crie um ficheiro chamado .env na raiz da pasta do backend (onde está backend_hospital.py).

Adicione a sua chave de API neste ficheiro no seguinte formato:

GOOGLE_API_KEY='SUA_CHAVE_DE_API_AQUI'

Substitua 'SUA_CHAVE_DE_API_AQUI' pela sua chave de API real.

Verifique os Ficheiros do Frontend:

Certifique-se de que tem os ficheiros menu_structure.html, menuStyle.css, menu.style.js, entradaDoHospital.html, entradaDoHospital.css, entradaDoHospital.js e a pasta imagens com as imagens dos avatares (homenBranco.png, homenPreto.png, mulherBranca.png, mulherPreta.png, enfermeiraEsquerda.png, psicologo.png, psicologa.png) na estrutura correta.

Como Executar
Inicie o Backend:

Abra um terminal na pasta do backend.

Execute o servidor Flask:

python backend_hospital.py

Mantenha este terminal a correr.

Abra o Frontend:

Abra o ficheiro menu_structure.html no seu navegador web.

Interaja com a Simulação:

Personalize o seu avatar no menu inicial.

Clique em "Iniciar Simulação" para ir para a cena da entrada do hospital.

Acompanhe a animação e interaja com a IA no chatbox que aparecerá.

Use o botão 'X' no chatbox para fechar a interface de chat quando desejar.

Estrutura do Projeto
.
├── backend/
│   ├── .env             # Arquivo para a API Key (não inclua no git!)
│   ├── backend_hospital.py # Código do servidor Flask e interação com a IA
│   └── requirements.txt # (Opcional) Liste as dependências aqui
├── imagens/           # Pasta para as imagens dos avatares e fundo
│   ├── homenBranco.png
│   ├── homenPreto.png
│   ├── mulherBranca.png
│   ├── mulherPreta.png
│   ├── enfermeiraEsquerda.png
│   ├── psicologo.png
│   ├── psicologa.png
│   └── hospital.png     # Imagem de fundo
├── menu_structure.html  # Página inicial de personalização do avatar
├── menuStyle.css        # Estilos para o menu de personalização
├── menu.style.js        # Lógica para o menu de personalização
├── entradaDoHospital.html # Cena da entrada do hospital com a simulação 2D e chat
├── entradaDoHospital.css  # Estilos para a cena da entrada do hospital
├── entradaDoHospital.js   # Lógica para a simulação 2D e chat na entrada
└── README.md            # Este ficheiro

(Nota: A estrutura pode variar ligeiramente dependendo de como organizou os seus ficheiros, ajuste conforme necessário.)

Melhorias Futuras
Expandir a simulação para outras áreas do hospital (consultórios, salas de terapia).

Adicionar mais opções de personalização de avatar (cabelo, roupas).

Implementar mini-jogos ou atividades interativas que representem terapias.

Desenvolver uma narrativa mais complexa com diferentes caminhos e finais.

Integrar sons e música ambiente para melhorar a imersão.

Licença
Este projeto está licenciado sob a Licença MIT. Veja o ficheiro LICENSE para mais detalhes. (Se não tiver um ficheiro LICENSE, pode criar um ou remover esta secção).

Agradecimento
Google Generative AI pela tecnologia de IA utilizada.

