// Log para confirmar que o script está sendo carregado
console.log("entradaDoHospital.js loaded");

// Garante que o DOM esteja completamente carregado antes de tentar obter os elementos
document.addEventListener('DOMContentLoaded', () => {
    // Obtém referências para os elementos necessários para a simulação
    const gameCanvas = document.getElementById('gameCanvas'); // Referência ao canvas
    const ctx = gameCanvas.getContext('2d'); // Contexto 2D para desenhar no canvas
    const messageBox = document.getElementById('message-box'); // Referência à caixa de mensagem

    // --- Elementos da Interface de Chat ---
    const chatContainer = document.getElementById('chat-container');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    // Opcional: Adicionar um elemento para mostrar com quem o usuário está a falar
    const chatTitle = document.createElement('h3');
    chatTitle.textContent = "Chat com a Enfermeira";
    chatTitle.style.textAlign = 'center';
    chatTitle.style.marginBottom = '10px';
    chatTitle.style.color = '#0277bd'; // Cor tema hospital
    chatContainer.insertBefore(chatTitle, chatBox); // Insere o título antes da caixa de chat

    // --- Botão de Fechar Chat (ADICIONADO) ---
    const closeChatButton = document.createElement('button');
    closeChatButton.textContent = 'X'; // Texto do botão
    closeChatButton.style.position = 'absolute'; // Posição absoluta para ficar no canto
    closeChatButton.style.top = '10px'; // Distância do topo
    closeChatButton.style.right = '10px'; // Distância da direita
    closeChatButton.style.backgroundColor = 'transparent'; // Fundo transparente
    closeChatButton.style.border = 'none'; // Sem borda
    closeChatButton.style.color = '#0277bd'; // Cor do texto/ícone
    closeChatButton.style.fontSize = '1.2em'; // Tamanho da fonte
    closeChatButton.style.cursor = 'pointer'; // Cursor de mão ao passar por cima
    closeChatButton.style.fontWeight = 'bold'; // Negrito
    closeChatButton.style.zIndex = '10'; // Garante que fique acima de outros elementos no contêiner
    chatContainer.appendChild(closeChatButton); // Adiciona o botão ao contêiner do chat

    // Listener para o botão de fechar
    closeChatButton.addEventListener('click', () => {
        console.log("Close button clicked. Ending chat.");
        endChat(); // Chama a função para fechar o chatbox
        showMessage('Interação com a Google IA finalizada pelo usuário.', 3000); // Mensagem para o usuário
        simulationState = 'finished'; // Define o estado como finalizado
        // Aqui você pode adicionar lógica para ir para a próxima cena, se necessário
    });
    // --- Fim do Botão de Fechar Chat ---


    // --- Variável para armazenar o ID da sessão de chat ---
    let currentChatSessionId = null;

    // --- Obter dados do personagem da URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const selectedGender = urlParams.get('gender') || 'male'; // Padrão para 'male' se não encontrado
    const selectedSkinColor = urlParams.get('skin') || 'blue'; // Padrão para 'blue' se não encontrado
    const characterImageUrl = urlParams.get('imageUrl'); // Obtém a URL da imagem do personagem

    // --- URLs dos Avatares ---
    // URL para o avatar da enfermeira
    const nurseAvatarUrl = 'imagens/enfermeiraEsquerda.png'; // Caminho para a imagem da enfermeira
    // URL para o avatar da psicóloga
    const psicologaAvatarUrl = 'imagens/psicologa.png'; // Caminho para a imagem da psicóloga (FEMININO)
    // URL para o avatar do psicólogo
    const psicologoAvatarUrl = 'imagens/psicologo.png'; // Caminho para a imagem do psicólogo (MASCULINO)
    // A URL do avatar do paciente é a characterImageUrl obtida da URL

    // --- Variável de estado para controlar o avatar da IA no chat ---
    let isChattingWithSpecialist = false;
    // Variável para armazenar o gênero do especialista para escolher o avatar
    let currentSpecialistGender = null; // Pode ser 'Masculino', 'Feminino', ou null


    // --- Declaração de variáveis no início do escopo ---
    // Localizações importantes para esta cena
    const locations = {
        start: { x: 50, y: 600, label: 'Início' }, // Ponto de partida (esquerda)
        hospitalEntrance: { x: 450, y: 600, label: 'Entrada do Hospital' }, // Posição da porta de entrada (ajustado para a direita)
        insideHospital: { x: 650, y: 600, label: 'Dentro do Hospital' }, // Posição X AJUSTADA para mais à direita
        inFrontOfNurse: { x: 0, y: 600, label: 'Frente da Enfermeira' } // Posição X será calculada dinamicamente
    };

    // Propriedades da porta simbólica (agora para bi-porta)
    const hospitalDoor = {
        x: locations.hospitalEntrance.x, // Posição X central da porta dupla
        y: locations.hospitalEntrance.y - 180, // Posição Y (topo da porta) - Ajuste conforme a altura do personagem
        totalWidth: 120, // Largura total da porta dupla (aumentado)
        height: 180, // Altura da porta (aumentado)
        color: '#78909c', // Cor da porta (cinza azulado)
        isOpen: false, // Estado da porta (aberta ou fechada)
        openingSpeed: 4, // Velocidade de abertura (para animação)
        closingSpeed: 6, // Velocidade de fechamento (para animação) - AUMENTADO AQUI
        currentWidth: 120 // Largura atual de cada metade da porta (inicialmente a largura total / 2)
    };
    hospitalDoor.currentWidth = hospitalDoor.totalWidth / 2;

    // Propriedades do sensor de presença simbólico
    const presenceSensor = {
        x: hospitalDoor.x, // Posição X do sensor (no centro da porta)
        y: hospitalDoor.y + hospitalDoor.height / 2, // Posição Y do sensor (no meio da porta)
        radius: 10, // Raio do sensor visual
        color: '#ff0000', // Cor inicial (vermelho - inativo)
        activeColor: '#00ff00', // Cor quando ativo (verde)
        detectionRadius: 100 // Raio de detecção do personagem
    };

    let characterImage = new Image();
    let isCharacterImageLoaded = false;

    const character = {
        x: 50, // Posição X inicial (esquerda)
        y: 600, // Posição Y inicial (base do personagem) - Ajustado para caber na tela
        width: 60, // Largura padrão inicial (ajustada para um tamanho razoável)
        height: 120, // Altura padrão inicial (ajustada para um tamanho razoável)
        color: '#0000FF', // Cor padrão (azul) - Usada apenas como fallback se a imagem não carregar
        speed: 2, // Velocidade de movimento
        targetX: 0, // Posição X alvo (será definida pela lógica do jogo)
        targetY: 600, // Posição Y alvo (será definida pela lógica do jogo)
        isMoving: false, // Indica se o personagem está se movendo
        animationFrame: 0, // Frame atual da animação de caminhada (para fallback ou spritesheet)
        animationSpeed: 8 // Velocidade da animação (menor = mais rápido)
    };

    // --- Propriedades da Enfermeira ---
    let nurseImage = new Image();
    let isNurseImageLoaded = false;

    const nurse = {
        x: 800, // Ajustado para uma posição MAIS à direita
        y: 600, // Alinhada com a base do personagem
        width: 80, // Largura padrão (ajustar se usar imagem real)
        height: 150, // Altura padrão (ajustar se usar imagem real)
        color: '#c2185b' // Cor simbólica (rosa escuro) - Usada apenas como fallback
    };

    // URL da imagem da enfermeira (substituída pelo caminho do arquivo)
    const nurseImageUrl = 'imagens/enfermeiraEsquerda.png'; // Caminho para a imagem da enfermeira


    // Estado atual da simulação para esta cena
    let simulationState = 'loading'; // Estado inicial temporário enquanto espera as imagens (ou fallback)

    // Função para iniciar a simulação após o carregamento das imagens ou uso do fallback
    function startSimulation() {
         console.log("Iniciando simulação...");
         simulationState = 'movingToEntrance'; // Define o estado inicial para iniciar o movimento
         setCharacterTarget(locations.hospitalEntrance.x, locations.hospitalEntrance.y); // Define o alvo para a entrada do hospital
         startAIGuidedSimulation(); // Inicia a sequência de mensagens da IA
         gameLoop(); // Inicia o loop de animação
    }

    // --- Funções de Simulação 2D ---

    function drawNurse(x, y, color) {
         ctx.fillStyle = '#000000';
         ctx.fillRect(x - 2, y - 2, 4, 4);

         if (isNurseImageLoaded) {
             const drawX = x - nurse.width / 2;
             const drawY = y - nurse.height;
             ctx.drawImage(nurseImage, drawX, drawY, nurse.width, nurse.height);
         } else {
             ctx.fillStyle = color;
             ctx.fillRect(x - nurse.width / 2, y - nurse.height, nurse.width, nurse.height - 20);
             ctx.beginPath();
             ctx.arc(x, y - nurse.height - 10, nurse.width / 3, 0, Math.PI * 2);
             ctx.fill();
         }
    }

    function drawCharacter(x, y, color, frame = 0) {
        if (isCharacterImageLoaded) {
            const drawX = x - character.width / 2;
            const drawY = y - character.height;
            ctx.drawImage(characterImage, drawX, drawY, character.width, character.height);
        } else {
            ctx.fillStyle = color;
            const legWidth = character.width / 2 - 2;
            const legHeight = character.legHeight;
            let legOffset1 = 0;
            let legOffset2 = 0;

            if (character.isMoving) {
                legOffset1 = (Math.floor(frame / character.animationSpeed) % 2 === 0) ? 2 : -2;
                legOffset2 = (Math.floor(frame / character.animationSpeed) % 2 === 0) ? -2 : 2;
            }

            ctx.fillRect(x - character.width / 2, y - legHeight - legOffset1, legWidth, legHeight);
            ctx.fillRect(x + character.width / 2 - legWidth, y - legHeight - legOffset2, legWidth, legHeight);

            ctx.fillRect(x - character.width / 2, y - character.legHeight - character.height, character.width, character.height);

            ctx.beginPath();
            ctx.arc(x, y - character.legHeight - character.height - character.headRadius, character.headRadius, 0, Math.PI * 2);
            ctx.fill();
        }

         if (character.isMoving) {
             character.animationFrame++;
         }
    }

    function drawScene() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawHospitalDoor();
        drawNurse(nurse.x, nurse.y, nurse.color);
        drawCharacter(character.x, character.y, character.color, character.animationFrame);

         ctx.fillStyle = '#000';
         ctx.font = '16px sans-serif';
         ctx.textAlign = 'center';
         ctx.fillText(locations.start.label, locations.start.x, locations.start.y + 30);
         ctx.fillText(locations.hospitalEntrance.label, locations.hospitalEntrance.x, locations.hospitalEntrance.y + 30);
         ctx.fillText(locations.insideHospital.label, locations.insideHospital.x, locations.insideHospital.y + 30);
    }

    function drawHospitalDoor() {
        ctx.fillStyle = hospitalDoor.color;

        const leftDoorX = hospitalDoor.x - hospitalDoor.currentWidth;
        ctx.fillRect(leftDoorX, hospitalDoor.y, hospitalDoor.currentWidth, hospitalDoor.height);

        const rightDoorX = hospitalDoor.x;
        ctx.fillRect(rightDoorX, hospitalDoor.y, hospitalDoor.currentWidth, hospitalDoor.height);

        if (hospitalDoor.isOpen && hospitalDoor.currentWidth === 0) {
            ctx.strokeStyle = hospitalDoor.color;
            ctx.lineWidth = 5;
            const frameX = hospitalDoor.x - hospitalDoor.totalWidth / 2;
            const frameY = hospitalDoor.y;
            ctx.strokeRect(frameX, frameY, hospitalDoor.totalWidth, hospitalDoor.height);
            ctx.lineWidth = 1;
        }

        ctx.fillStyle = presenceSensor.color;
        ctx.beginPath();
        ctx.arc(presenceSensor.x, presenceSensor.y, presenceSensor.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function moveCharacter() {
        if (simulationState !== 'movingToEntrance' && simulationState !== 'movingIntoHospital' && simulationState !== 'movingToNurse') {
             return;
        }

        const dx = character.targetX - character.x;
        const dy = character.targetY - character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < character.speed) {
            console.log(`moveCharacter: Reached target for state ${simulationState}. Current X: ${character.x.toFixed(2)}, Target X: ${character.targetX.toFixed(2)}`);
            character.x = character.targetX;
            character.y = character.targetY;
            character.isMoving = false;
            handleStateChange();
        } else {
            character.x += (dx / distance) * character.speed;
            character.y += (dy / distance) * character.speed;
        }
    }

    function setCharacterTarget(x, y) {
        console.log("setCharacterTarget called. Setting target to X:", x, "Y:", y);
        character.targetX = x;
        character.targetY = y;
        character.isMoving = true;
    }

    function showMessage(message, duration = 3000) {
        messageBox.textContent = message;
        messageBox.style.display = 'block';

        if (duration > 0) {
            setTimeout(() => {
                hideMessage();
            }, duration);
        }
    }

    function hideMessage() {
        messageBox.style.display = 'none';
    }

    // --- FUNÇÃO MODIFICADA: Adiciona mensagens com avatares e considera o estado do chat ---
    function addChatMessage(sender, message) {
        console.log(`addChatMessage called for sender: ${sender}, message: ${message}`); // Log para depuração
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');

        const avatarElement = document.createElement('img');
        avatarElement.classList.add('chat-avatar');

        const textElement = document.createElement('div');
        textElement.classList.add('message-text');
        textElement.textContent = message; // A mensagem já vem formatada do backend se necessário

        if (sender === "Google IA") {
            messageElement.classList.add('ai-message');
            avatarElement.classList.add('ai-avatar');
            // --- Lógica para escolher o avatar da IA (MODIFICADA) ---
            console.log(`Avatar Logic: isChattingWithSpecialist=${isChattingWithSpecialist}, currentSpecialistGender=${currentSpecialistGender}`); // Log de depuração
            if (isChattingWithSpecialist && currentSpecialistGender) {
                 // Usa o gênero armazenado para escolher o avatar
                 if (currentSpecialistGender.toLowerCase() === 'feminino') {
                     console.log("Using Psicologa avatar:", psicologaAvatarUrl);
                     avatarElement.src = psicologaAvatarUrl; // Avatar da psicóloga
                     avatarElement.alt = "Avatar Psicóloga";
                 } else { // Assume Masculino ou outro caso como padrão para psicologo.png
                     console.log("Using Psicologo avatar:", psicologoAvatarUrl);
                     avatarElement.src = psicologoAvatarUrl; // Avatar do psicólogo
                     avatarElement.alt = "Avatar Psicólogo";
                 }
                 // Adiciona um handler de erro para o caso das imagens do especialista não carregarem
                 avatarElement.onerror = () => {
                     console.error("Erro ao carregar a imagem do avatar do especialista:", avatarElement.src);
                     // Opcional: Substituir por uma imagem de fallback ou esconder o avatar
                 };
            } else {
                 console.log("Using Nurse avatar:", nurseAvatarUrl);
                 avatarElement.src = nurseAvatarUrl; // Avatar da enfermeira
                 avatarElement.alt = "Avatar Enfermeira";
                 // Adiciona um handler de erro para o caso da imagem da enfermeira não carregar
                 avatarElement.onerror = () => {
                     console.error("Erro ao carregar a imagem do avatar da enfermeira:", avatarElement.src);
                     // Opcional: Substituir por uma imagem de fallback ou esconder o avatar
                 };
            }
            // --- Fim da lógica de avatar da IA ---

            messageElement.appendChild(avatarElement);
            messageElement.appendChild(textElement);
        } else { // Assumimos que é o usuário ("Você")
            console.log("Adding user message with avatar:", decodeURIComponent(characterImageUrl)); // Log para avatar do usuário
            messageElement.classList.add('user-message');
            avatarElement.classList.add('user-avatar');
            // Usa a URL da imagem do personagem obtida da URL
            // Adiciona um handler de erro para o caso da imagem do personagem não carregar
            avatarElement.onerror = () => {
                console.error("Erro ao carregar a imagem do avatar do personagem:", avatarElement.src);
                // Opcional: Substituir por uma imagem de fallback ou esconder o avatar
                // avatarElement.src = 'caminho/para/fallback_paciente.png';
                // avatarElement.style.display = 'none';
            };
            avatarElement.src = decodeURIComponent(characterImageUrl);
            avatarElement.alt = "Avatar Paciente";
            messageElement.appendChild(textElement); // Texto antes do avatar para o usuário
            messageElement.appendChild(avatarElement);
        }

        chatBox.appendChild(messageElement);
        // Rolagem automática para a mensagem mais recente
        chatBox.scrollTop = chatBox.scrollHeight;
         console.log("Message added to chatBox."); // Log de confirmação
    }


    // --- FUNÇÃO MODIFICADA: Agora chama o backend real com session_id e verifica a recomendação ---
    async function callBackendGoogleAI(message) {
        // Define a URL do backend fora do try block
        const backendUrl = 'http://127.0.0.1:5000/chat';

        // Verifica se já temos um session_id. Se não, algo está errado ou a sessão não foi iniciada.
        if (!currentChatSessionId) {
            console.error("Erro: session_id não disponível para chamar o backend.");
            return "Erro interno: Sessão de chat não iniciada corretamente.";
        }

        try {
            console.log(`Calling backend (${backendUrl}) for session ${currentChatSessionId} with message:`, message);

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: currentChatSessionId, message: message })
            });

            // --- VERIFICAÇÃO DE SESSÃO APÓS RESPOSTA ---
            // Se a resposta for 404, significa que a sessão no backend foi encerrada.
            if (response.status === 404) {
                 console.warn("Backend returned 404. Session likely ended on the server.");
                 const errorData = await response.json();
                 // Exibe a mensagem de erro no chat e encerra o chatbox no frontend
                 addChatMessage("Google IA", `Erro: A sessão de chat foi encerrada inesperadamente pelo servidor. Detalhes: ${errorData.error || "Desconhecido."}`);
                 endChat(); // Encerra o chatbox no frontend
                 return null; // Retorna null para interromper o fluxo normal de processamento da resposta
            }
            // --- FIM DA VERIFICAÇÃO DE SESSÃO ---


            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro do backend:", response.status, errorData.error);
                return `Erro ao obter resposta da IA. Status: ${response.status}. Detalhes: ${errorData.error || "Erro desconhecido."} (URL: ${backendUrl})`;
            }

            const data = await response.json();
            console.log("Response from backend:", data);

            const aiResponseText = data.reply;

            // --- Verifica se a resposta contém a recomendação ---
            // Se a recomendação for detetada E ainda não estivermos no chat com o especialista,
            // mude o estado, o título E extraia o gênero para o avatar.
            if (aiResponseText.includes("Recomendação de Especialista:") && !isChattingWithSpecialist) {
                isChattingWithSpecialist = true; // Muda o estado para chat com especialista

                // Extrai o nome da área e o gênero da resposta
                const recommendationMatch = aiResponseText.match(/Recomendação de Especialista: (.+?) \((.+?)\)/);
                let specialistName = "Especialista"; // Padrão
                let specialistGender = null; // Padrão

                if (recommendationMatch && recommendationMatch[1] && recommendationMatch[2]) {
                     specialistName = recommendationMatch[1].trim();
                     specialistGender = recommendationMatch[2].trim();
                     chatTitle.textContent = `Chat com ${specialistName}`; // Exibe o nome do especialista
                     currentSpecialistGender = specialistGender; // Armazena o gênero
                     console.log(`Detected Specialist: ${specialistName}, Gender: ${specialistGender}`);
                } else {
                     // Se o formato não corresponder, tenta extrair apenas o nome e usa gênero padrão
                     const nameOnlyMatch = aiResponseText.match(/Recomendação de Especialista: (.+)/);
                     if (nameOnlyMatch && nameOnlyMatch[1]) {
                         specialistName = nameOnlyMatch[1].trim();
                         chatTitle.textContent = `Chat com ${specialistName}`;
                         console.log(`Detected Specialist Name Only: ${specialistName}. Gender unknown, using default avatar.`);
                         currentSpecialistGender = null; // Gênero desconhecido
                     } else {
                         chatTitle.textContent = "Chat com o Especialista"; // Fallback
                         currentSpecialistGender = null; // Gênero desconhecido
                     }
                }

                 console.log("Recommendation detected. Switching to specialist chat state.");
                 // A chamada para endChat() não acontece mais aqui.
            }
            // --- Fim da verificação de recomendação ---

            return aiResponseText; // Retorna o texto da resposta da IA

        } catch (error) {
            console.error("Erro ao conectar com o backend:", error);
            return `Erro de comunicação com o serviço de IA. Verifique se o backend está rodando em ${backendUrl}. Detalhes: ${error}`;
        }
    }

    // Função que inicia uma NOVA sessão de chat chamando o backend
    async function startNewChatSession() {
        try {
            const backendUrl = 'http://127.0.0.1:5000/start_chat_session'; // Endpoint para iniciar a sessão

            console.log(`Calling backend (${backendUrl}) to start new chat session.`);

            const response = await fetch(backendUrl, {
                method: 'GET' // Método GET para iniciar a sessão
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 console.error("Erro ao iniciar sessão no backend:", response.status, errorData.error);
                 showMessage('Erro ao iniciar o chat com a IA. Tente novamente mais tarde.', 5000);
                 return null; // Retorna null em caso de erro
            }

            const data = await response.json();
            console.log("New session started:", data);
            currentChatSessionId = data.session_id; // Armazena o session_id retornado
            isChattingWithSpecialist = false; // Garante que o estado inicial é enfermeira
            currentSpecialistGender = null; // Reseta o gênero do especialista
            chatTitle.textContent = "Chat com a Enfermeira"; // Define o título inicial
            return data.initial_message; // Retorna a primeira mensagem da IA

        } catch (error) {
            console.error("Erro ao conectar com o backend para iniciar sessão:", error);
            showMessage('Erro de comunicação ao iniciar o chat. Verifique o backend.', 5000);
            return null; // Retorna null em caso de erro
        }
    }

    // A função que é chamada quando o usuário envia uma mensagem no chat
    async function simulateGoogleAIResponse(message) {
        // --- Lógica para finalizar o chat baseada APENAS na entrada do usuário (MODIFICADO) ---
        // Esta lógica AGORA APENAS ENVIA a mensagem para a IA.
        // O fechamento do chatbox é controlado pelo botão 'X' ou pela detecção de erro 404.
        if (message.toLowerCase() === 'fim' || message.toLowerCase() === 'tchau') {
             console.log(`User input "${message}" detected. Sending to AI for final response.`);
             // Continua para enviar a mensagem para a IA.
             // A IA deve responder com "Chat finalizado." conforme instruído no backend.
             // O fechamento real do chatbox ocorrerá APENAS pelo clique no botão 'X' ou erro 404.
        }
        // --- Fim da lógica de finalizar o chat baseada na entrada do usuário ---


        // Desabilita o input e o botão enquanto espera a resposta da IA
        chatInput.disabled = true;
        sendButton.disabled = true;
        chatInput.placeholder = "Aguardando resposta...";

        const aiResponse = await callBackendGoogleAI(message); // Chama a função que se comunica com o backend

        // Se a chamada ao backend retornou null (erro 404 tratado em callBackendGoogleAI), a mensagem de erro e o fechamento já foram tratados.
        if (aiResponse !== null) {
            addChatMessage("Google IA", aiResponse); // Usa a função modificada para adicionar a mensagem da IA com avatar
        }


        // Reabilita o input e o botão
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.placeholder = "Digite sua mensagem...";
        chatInput.focus();

        // A lógica de encerramento baseada na resposta da IA foi movida para callBackendGoogleAI (tratamento do 404).
        // A lógica de encerramento baseada na entrada do usuário agora apenas sinaliza para a IA.
        // O FECHAMENTO REAL DO CHATBOX É AGORA CONTROLADO APENAS PELO BOTÃO 'X' ou erro 404.
    }

    // Função para iniciar a interface de chat (AGORA CHAMA O BACKEND PARA INICIAR A SESSÃO)
    async function startChat() {
        console.log("Attempting to start chat with Nurse (Google IA)");
        chatContainer.style.display = 'flex'; // Mostra o contêiner de chat
        chatBox.innerHTML = ''; // Limpa mensagens antigas

        // --- Desabilita input e botão enquanto espera a sessão ---
        chatInput.disabled = true;
        sendButton.disabled = true;
        chatInput.placeholder = "Iniciando chat...";
        // --- Fim da desabilitação ---


        // Inicia uma nova sessão de chat e obtém a primeira mensagem
        const initialMessage = await startNewChatSession();

        if (initialMessage !== null) {
            addChatMessage("Google IA", initialMessage); // Usa a função modificada para adicionar a primeira mensagem da IA com avatar
            chatInput.value = ''; // Limpa o campo de entrada

            // --- Habilita input e botão após sessão iniciada ---
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatInput.placeholder = "Digite sua mensagem...";
            chatInput.focus(); // Coloca o foco no campo de entrada
            // --- Fim da habilitação ---

            simulationState = 'chattingWithNurse'; // Muda o estado para chat
            console.log("Chat session started successfully.");
        } else {
            // Se a sessão não pôde ser iniciada, esconde o chat novamente
            endChat(); // Isso também limpa currentChatSessionId
            simulationState = 'finished'; // Ou outro estado apropriado de erro/fim
            console.error("Failed to start chat session.");
             // Opcional: Redirecionar ou mostrar uma mensagem de erro permanente
        }
    }

    // Função para terminar a interface de chat
    function endChat() {
        console.log("Ending chat with Nurse/Specialist."); // Atualizado o log
        chatContainer.style.display = 'none'; // Esconde o contêiner de chat
        chatBox.innerHTML = ''; // Limpa o chat
        currentChatSessionId = null; // Limpa o ID da sessão ao terminar o chat
        isChattingWithSpecialist = false; // Reseta o estado do avatar da IA
        currentSpecialistGender = null; // Reseta o gênero do especialista
        chatTitle.textContent = "Chat Inativo"; // Reseta o título
         // --- Habilita input e botão (caso tenham sido desabilitados por erro) ---
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.placeholder = "Chat inativo.";
        // --- Fim da habilitação ---
    }


    // Listeners para a interface de chat
    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        // Verifica se há mensagem E se há um session_id ativo
        if (message && currentChatSessionId) {
            addChatMessage("Você", message); // Usa a função modificada para adicionar a mensagem do usuário com avatar
            simulateGoogleAIResponse(message); // Chama a função que interage com o backend
            chatInput.value = ''; // Limpa o campo de entrada
        } else if (!currentChatSessionId) {
             console.warn("Attempted to send message, but chat session is not active.");
             // A mensagem de erro já é mostrada pela função startChat() ou se houver erro na chamada do backend.
             // Não precisa mostrar outra aqui, a UI desabilitada já indica o estado.
        }
    });

    chatInput.addEventListener('keypress', (event) => {
        // Envia a mensagem ao pressionar Enter
        // Verifica se pressionou Enter E se há um session_id ativo
        if (event.key === 'Enter' && currentChatSessionId) {
            sendButton.click(); // Simula o clique no botão de enviar
        }
    });


    // Função para lidar com as mudanças de estado da simulação
    function handleStateChange() {
        console.log("handleStateChange called, current state:", simulationState); // Log para handleStateChange
        switch (simulationState) {
            case 'movingToEntrance':
                if (!character.isMoving) {
                     showMessage('Sensor de presença ativado. Abrindo porta...', 3000);
                     simulationState = 'atEntrance';
                     presenceSensor.color = presenceSensor.activeColor;
                     setTimeout(() => {
                         simulationState = 'openingDoor';
                         console.log("State changed to openingDoor");
                     }, 1000);
                }
                break;

            case 'atEntrance':
                break;

            case 'openingDoor':
                 console.log("Opening door. Current width:", hospitalDoor.currentWidth.toFixed(2));
                 if (hospitalDoor.currentWidth <= 0) {
                     hospitalDoor.currentWidth = 0;
                     hospitalDoor.isOpen = true;
                     showMessage('Porta aberta. Entrando no hospital...', 3000);
                     simulationState = 'movingIntoHospital';
                     console.log("State changed to movingIntoHospital");
                     setCharacterTarget(locations.insideHospital.x, locations.insideHospital.y);
                 } else {
                     hospitalDoor.currentWidth -= hospitalDoor.openingSpeed;
                     if (hospitalDoor.currentWidth < 0) hospitalDoor.currentWidth = 0;
                 }
                break;

            case 'movingIntoHospital':
                 if (!character.isMoving) {
                     simulationState = 'atInsideHospital';
                     console.log("Character arrived at insideHospital, initiating closing.");
                     handleStateChange();
                 }
                break;

            case 'atInsideHospital':
                 console.log("Character arrived at insideHospital, initiating closing.");
                 showMessage('Porta fechando...', 2000);
                 simulationState = 'closingDoor';
                 console.log("State changed to closingDoor");
                 presenceSensor.color = '#ff0000';
                 break;

            case 'closingDoor':
                 console.log("Closing door. Current width:", hospitalDoor.currentWidth.toFixed(2));
                 if (hospitalDoor.currentWidth >= hospitalDoor.totalWidth / 2) {
                     hospitalDoor.currentWidth = hospitalDoor.totalWidth / 2;
                     hospitalDoor.isOpen = false;
                     console.log("Door finished closing. State changing to movingToNurse");
                     showMessage('Chegou dentro do hospital. Aproximando-se da enfermeira.', 3000);
                     simulationState = 'movingToNurse';
                     locations.inFrontOfNurse.x = nurse.x - (nurse.width / 2) - (character.width / 2) - 20;
                     setCharacterTarget(locations.inFrontOfNurse.x, locations.inFrontOfNurse.y);
                 } else {
                     hospitalDoor.currentWidth += hospitalDoor.closingSpeed;
                     if (hospitalDoor.currentWidth > hospitalDoor.totalWidth / 2) hospitalDoor.currentWidth = hospitalDoor.totalWidth / 2;
                 }
                break;

            case 'movingToNurse':
                 if (!character.isMoving) {
                     console.log("Character arrived at nurse. State changing to startingChat");
                     showMessage('Olá, enfermeira (Google IA).', 2000);
                     simulationState = 'startingChat'; // NOVO ESTADO: Indica que estamos prestes a iniciar o chat
                     setTimeout(() => {
                         hideMessage();
                         startChat(); // Chama a função que inicia a interface de chat E a sessão no backend
                     }, 2500);
                 }
                break;

            case 'startingChat':
                 // Estado temporário enquanto a sessão de chat está sendo iniciada no backend
                 // A transição para 'chattingWithNurse' acontece dentro de startChat()
                 break;

            case 'chattingWithNurse':
                // Personagem está interagindo com a enfermeira via chat
                // A lógica de chat é tratada pelos listeners dos botões/input
                // O loop de jogo continua para desenhar a cena de fundo
                break;

            case 'finished':
                // Simulação da entrada finalizada
                // Pode adicionar um pequeno atraso antes de fazer algo mais (redirecionar, etc.)
                break;

            default:
                console.warn("Estado de simulação desconhecido:", simulationState);
        }
    }

    function startAIGuidedSimulation() {
        showMessage('Olá! Eu sou a Google IA. Iniciando sua jornada para o Hospital Psiquiátrico.', 5000);
        setTimeout(() => {
             showMessage('Dirigindo-se para a entrada...', 5000);
        }, 6000);
    }

    function startSimulation() {
         console.log("Iniciando simulação...");
         simulationState = 'movingToEntrance';
         setCharacterTarget(locations.hospitalEntrance.x, locations.hospitalEntrance.y);
         startAIGuidedSimulation();
         gameLoop();
    }

    function gameLoop() {
        if (character.isMoving && (simulationState === 'movingToEntrance' || simulationState === 'movingIntoHospital' || simulationState === 'movingToNurse')) {
             moveCharacter();
        }

        if (simulationState === 'openingDoor' || simulationState === 'closingDoor' || simulationState === 'movingIntoHospital' || simulationState === 'movingToNurse') {
             handleStateChange();
        }

        drawScene();

        if (simulationState !== 'finished') {
             requestAnimationFrame(gameLoop);
        } else {
             console.log("gameLoop: Simulation finished. Stopping animation loop.");
        }
    }

    // --- Carregamento da Imagem do Personagem ---
    if (characterImageUrl) {
        characterImage.onload = () => {
            isCharacterImageLoaded = true;
            console.log("Imagem do personagem carregada com sucesso.");
            const maxCharacterWidth = 100;
            const maxCharacterHeight = 180;
            const aspectRatio = characterImage.naturalWidth / characterImage.naturalHeight;
            let scaledWidth = maxCharacterWidth;
            let scaledHeight = maxCharacterWidth / aspectRatio;

            if (scaledHeight > maxCharacterHeight) {
                scaledHeight = maxCharacterHeight;
                scaledWidth = maxCharacterHeight * aspectRatio;
            }
            character.width = scaledWidth;
            character.height = scaledHeight;
            console.log(`Dimensões do personagem definidas: ${character.width.toFixed(2)}x${character.height.toFixed(2)}`);
            drawScene();
            if (isCharacterImageLoaded && (isNurseImageLoaded || nurseImageUrl === '')) {
                 startSimulation();
            }
        };
        characterImage.onerror = () => {
            console.error("Erro ao carregar a imagem do personagem:", characterImageUrl);
            isCharacterImageLoaded = false;
            console.warn("Usando personagem fallback (azul) devido a erro no carregamento da imagem.");
            character.width = 60;
            character.height = 120;
            if (isNurseImageLoaded || nurseImageUrl === '') {
                 startSimulation();
            }
        };
        // Decodifica a URL da imagem para garantir que caracteres especiais sejam tratados corretamente
        characterImage.src = decodeURIComponent(characterImageUrl);
        console.log("Tentando carregar imagem do personagem:", characterImage.src);
    } else {
        console.warn("URL da imagem do personagem não encontrada na URL. Usando fallback.");
        isCharacterImageLoaded = false;
        character.width = 60;
        character.height = 120;
        if (isNurseImageLoaded || nurseImageUrl === '') {
             startSimulation();
        }
    }

    // --- Carregamento da Imagem da Enfermeira ---
    nurseImage.onload = () => {
        isNurseImageLoaded = true;
        console.log("Imagem da enfermeira carregada com sucesso.");
        const targetNurseHeight = 160;
        const nurseAspectRatio = nurseImage.naturalWidth / nurseImage.naturalHeight;
        nurse.height = targetNurseHeight;
        nurse.width = targetNurseHeight * nurseAspectRatio;

        const maxNurseWidth = 100;
         if (nurse.width > maxNurseWidth) {
             nurse.width = maxNurseWidth;
             nurse.height = maxNurseWidth / nurseAspectRatio;
         }
        console.log(`Dimensões da enfermeira definidas: ${nurse.width.toFixed(2)}x${nurse.height.toFixed(2)}`);

        drawScene();
        if (isCharacterImageLoaded && (isNurseImageLoaded || nurseImageUrl === '')) {
             startSimulation();
        }
    };
    nurseImage.onerror = () => {
        console.error("Erro ao carregar a imagem da enfermeira:", nurseImageUrl);
        isNurseImageLoaded = false;
        console.warn("Usando enfermeira fallback (rosa) devido a erro no carregamento da imagem.");
        nurse.width = 80;
        nurse.height = 150;
        drawScene();
        if (isCharacterImageLoaded || characterImageUrl === '') {
             startSimulation();
        }
    };
    nurseImage.src = nurseImageUrl;
    console.log("Tentando carregar imagem da enfermeira:", nurseImage.src);

}); // Fim do DOMContentLoaded listener
