// Log para confirmar que o script está sendo carregado
console.log("hospital.js loaded");

// Garante que o DOM esteja completamente carregado antes de tentar obter os elementos
document.addEventListener('DOMContentLoaded', () => {
    // Obtém referências para os elementos necessários para a simulação
    const gameCanvas = document.getElementById('gameCanvas'); // Referência ao canvas
    const ctx = gameCanvas.getContext('2d'); // Contexto 2D para desenhar no canvas
    const messageBox = document.getElementById('message-box'); // Referência à caixa de mensagem

    // As referências aos elementos do menu de personalização foram removidas
    // pois a simulação iniciará diretamente.
    // const customizationMenu = document.getElementById('customization-menu');
    // const startButton = document.getElementById('start-button');
    // const skinColorSelect = document.getElementById('skin-color');
    // const genderRadios = document.querySelectorAll('input[name="gender"]');
    // const characterPreviewImage = document.getElementById('character-preview');


    // Propriedades do personagem (boneco) - Mantidas para a lógica 2D de movimento e estado
    // Como o menu foi removido, definimos valores padrão para gênero e cor.
    const character = {
        x: 50, // Posição X inicial
        y: 600, // Posição Y inicial (base do personagem)
        width: 15, // Largura do corpo/pernas para desenho
        height: 30, // Altura do corpo para desenho
        headRadius: 8, // Raio da cabeça para desenho
        legHeight: 20, // Altura das pernas para desenho
        color: '#0000FF', // Cor padrão (azul) - Definida diretamente
        originalColor: '#0000FF', // Armazena a cor original para uso temporário
        speed: 2, // Velocidade de movimento
        targetX: 50, // Posição X alvo para movimento
        targetY: 600, // Posição Y alvo para movimento
        isMoving: false, // Indica se o personagem está se movendo
        gender: 'male', // Gênero padrão - Definido diretamente
        animationFrame: 0, // Frame atual da animação de caminhada
        animationSpeed: 8 // Velocidade da animação (menor = mais rápido)
    };

    // Propriedades do psicólogo (forma simplificada)
    const psychologist = {
         width: 15,
         height: 30,
         headRadius: 8,
         legHeight: 20,
         color: '#800080' // Cor roxa para o psicólogo
    };

    // Propriedades do recepcionista
    const receptionist = {
         x: 415, // Posição X na recepção
         y: 530, // Posição Y na recepção
         width: 15,
         height: 30,
         headRadius: 8,
         legHeight: 20,
         color: '#ff007f' // Cor rosa para o recepcionista
    };


    // Localizações importantes na simulação
    const locations = {
        start: { x: 50, y: 600, label: 'Início' }, // Ponto de partida
        hospitalEntrance: { x: 400, y: 600, label: 'Entrada do Hospital' }, // Posição da porta do hospital
        receptionArea: { x: 400, y: 520, label: 'Recepção', width: 180, height: 80 }, // Posição e tamanho da área da recepção
        waitingArea: { x: 400, y: 420, label: 'Área de Espera', width: 200, height: 100 }, // Área de espera antes da triagem
        triage: { x: 400, y: 250, label: 'Triagem' }, // Posição da triagem
        specialistsAreaEntrance: { x: 445, y: 150, label: 'Entrada Área Especialistas' }, // Entrada da área geral dos especialistas
        specialistsArea: { x: 600, y: 100, width: 250, height: 450, label: 'Área de Especialistas' }, // Área geral dos especialistas
         hospitalExit: { x: 800, y: 600, label: 'Saída do Hospital' }, // Nova saída no lado direito
        specialists: [ // Lista de especialistas com suas posições e cores
            { name: 'Psicologia Clínica', roomX: 605, roomY: 110, roomWidth: 240, roomHeight: 40, color: 'green' },
            { name: 'Psicologia Educacional', roomX: 605, roomY: 160, roomWidth: 240, roomHeight: 40, color: 'purple' },
            { name: 'Psicologia Organizacional', roomX: 605, roomY: 210, roomWidth: 240, roomHeight: 40, color: 'orange' },
            { name: 'Psicologia Social', roomX: 605, roomY: 260, roomWidth: 240, roomHeight: 40, color: 'brown' },
            { name: 'Psicologia Jurídica', roomX: 605, roomY: 310, roomWidth: 240, roomHeight: 40, color: 'red' },
            { name: 'Psicologia de Trânsito', roomX: 605, roomY: 360, roomWidth: 240, roomHeight: 40, color: 'teal' },
            { name: 'Psicologia Esportiva', roomX: 605, roomY: 410, roomWidth: 240, roomHeight: 40, color: 'navy' },
            { name: 'Psicologia Hospitalar', roomX: 605, roomY: 460, roomWidth: 240, roomHeight: 40, color: 'olive' },
            { name: 'Neuropsicologia', roomX: 605, roomY: 510, roomWidth: 240, roomHeight: 40, color: 'magenta' }
        ],
        selectedSpecialist: null // Armazena o especialista selecionado aleatoriamente
    };

    // Propriedades da cena de consulta
    const consultationRoom = {
        bgColor: '#f0f8ff', // Cor de fundo da sala
        wallColor: '#d3d3d3', // Cor das paredes
        floorColor: '#e0e0e0', // Cor do chão
        deskColor: '#a0522d', // Cor da mesa (marrom)
        chairColor: '#556b2f', // Cor das cadeiras (verde escuro)
        rugColor: '#b0c4de', // Cor do tapete
        vaseColor: '#8fbc8f', // Cor do vaso
        flowerColor: '#ff69b4', // Cor das flores (rosa)
        windowColor: '#add8e6', // Cor da janela (azul claro)
        desk: { x: 300, y: 350, width: 200, height: 30 }, // Posição e tamanho da mesa do doutor
        patientChair: { x: 350, y: 400, width: 30, height: 30 }, // Posição e tamanho da cadeira do paciente
        psychologistChair: { x: 420, y: 400, width: 30, height: 30 },  // Posição e tamanho da cadeira do psicólogo
        rug: { x: 280, y: 450, width: 240, height: 80 }, // Posição e tamanho do tapete
        vase: { x: 450, y: 320, width: 15, height: 30 }, // Posição e tamanho do vaso
        window: { x: 100, y: 150, width: 150, height: 100 } // Posição e tamanho da janela
    };


    // Mapeamento de "casos" para tipos de psicólogos (simplificado)
    const caseToSpecialist = {
        anxiety: 'Psicologia Clínica',
        depression: 'Psicologia Clínica',
        learning: 'Psicologia Educacional',
        career: 'Psicologia Organizacional',
        social: 'Psicologia Social',
        legal: 'Psicologia Jurídica',
        traffic: 'Psicologia de Trânsito',
        sports: 'Psicologia Esportiva',
        hospital: 'Psicologia Hospitalar',
        memory: 'Neuropsicologia'
    };

    // Estado atual da simulação
    // Define o estado inicial diretamente para iniciar no hospital
    let simulationState = 'movingToEntrance';


    // --- Funções de Simulação 2D ---

    // Função para desenhar a cena completa no canvas
    function drawScene() {
        // Limpa o canvas antes de desenhar
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Desenha a cena com base no estado atual
        if (simulationState !== 'inConsultation' && simulationState !== 'customizing') {
            // Desenha o chão
            ctx.fillStyle = '#e0e0e0'; // Cor cinza clara para o chão
            ctx.fillRect(0, gameCanvas.height - 100, gameCanvas.width, 100);

            // Desenha o edifício do hospital
            ctx.fillStyle = '#c0c0c0'; // Cor cinza médio para o edifício
            ctx.fillRect(200, 50, 650, 550); // Parte principal do edifício
            ctx.fillStyle = '#a0a0a0'; // Cor cinza mais escura para a porta de entrada
            ctx.fillRect(390, 550, 20, 50); // Porta de entrada

             // Desenha a porta de saída
            ctx.fillStyle = '#a0a0a0'; // Cor cinza mais escura para a porta de saída
            ctx.fillRect(locations.hospitalExit.x - 10, locations.hospitalExit.y - 50, 20, 50); // Porta de saída


            // Desenha a área de recepção
            ctx.fillStyle = '#f5f5dc'; // Cor bege para a recepção
            ctx.fillRect(locations.receptionArea.x - locations.receptionArea.width / 2, locations.receptionArea.y - locations.receptionArea.height / 2, locations.receptionArea.width, locations.receptionArea.height);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(locations.receptionArea.x - locations.receptionArea.width / 2, locations.receptionArea.y - locations.receptionArea.height / 2, locations.receptionArea.width, locations.receptionArea.height);
            ctx.fillStyle = '#000';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(locations.receptionArea.label, locations.receptionArea.x, locations.receptionArea.y - locations.receptionArea.height / 2 - 10); // Rótulo da recepção

            // Desenha o balcão da recepção
            ctx.fillStyle = '#8b4513'; // Cor marrom para o balcão
            ctx.fillRect(locations.receptionArea.x - locations.receptionArea.width / 2, locations.receptionArea.y - locations.receptionArea.height / 2 + locations.receptionArea.height * 0.8, locations.receptionArea.width, locations.receptionArea.height * 0.2);

            // Desenha o recepcionista
            drawCharacter(locations.receptionArea.x, locations.receptionArea.y + locations.receptionArea.height / 4, receptionist.color);


            // Desenha as paredes internas e corredores
            ctx.fillStyle = '#d3d3d3'; // Cor cinza clara para as paredes
            const corridorWidth = 60;
            ctx.fillRect(350 - corridorWidth / 2 + 50, 50, corridorWidth, 500); // Parede esquerda do corredor principal
            ctx.fillRect(450 - corridorWidth / 2 + 50, 50, corridorWidth, 500); // Parede direita do corredor principal


            // Segmentos de parede conectando ao Triage
            ctx.fillRect(350 - corridorWidth / 2 + corridorWidth + 50, 200, 40, 10); // Segmento de parede à esquerda da entrada da Triagem
            ctx.fillRect(410 + corridorWidth / 2 - 40 + 50, 200, 40, 10); // Segmento de parede à direita da entrada da Triagem


            // Segmentos de parede conectando à Área de Especialistas
            ctx.fillRect(450 + corridorWidth / 2 + 50, 50, 150, 10); // Segmento de parede superior levando à Área de Especialistas
            ctx.fillRect(450 + corridorWidth / 2 + 550, 50, 10, 500); // Parede direita da área de especialistas


            // Desenha a área de triagem
            ctx.fillStyle = '#f0f8ff'; // Cor azul clara para a área
            ctx.fillRect(350, 200, 100, 100);
            ctx.strokeStyle = '#000'; // Borda preta
            ctx.strokeRect(350, 200, 100, 100);
            ctx.fillStyle = '#000'; // Cor do texto preta
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(locations.triage.label, locations.triage.x, locations.triage.y - 60); // Rótulo da triagem

            // Desenha a área de espera
            ctx.fillStyle = '#f0f0f0'; // Cor cinza clara para a área de espera
            ctx.fillRect(locations.waitingArea.x - locations.waitingArea.width / 2, locations.waitingArea.y - locations.waitingArea.height / 2, locations.waitingArea.width, locations.waitingArea.height);
            ctx.strokeStyle = '#000'; // Borda preta
            ctx.strokeRect(locations.waitingArea.x - locations.waitingArea.width / 2, locations.waitingArea.y - locations.waitingArea.height / 2, locations.waitingArea.width, locations.waitingArea.height);
            ctx.fillStyle = '#000'; // Cor do texto preta
            ctx.fillText(locations.waitingArea.label, locations.waitingArea.x, locations.waitingArea.y - locations.waitingArea.height / 2 - 10); // Rótulo da área de espera

            // Desenha algumas cadeiras na área de espera
            ctx.fillStyle = '#8b4513'; // Cor marrom para as cadeiras
            ctx.fillRect(locations.waitingArea.x - locations.waitingArea.width / 2 + 20, locations.waitingArea.y - locations.waitingArea.height / 2 + 20, 20, 20);
            ctx.fillRect(locations.waitingArea.x + locations.waitingArea.width / 2 - 40, locations.waitingArea.y - locations.waitingArea.height / 2 + 20, 20, 20);
            ctx.fillRect(locations.waitingArea.x - locations.waitingArea.width / 2 + 20, locations.waitingArea.y + locations.waitingArea.height / 2 - 40, 20, 20);
            ctx.fillRect(locations.waitingArea.x + locations.waitingArea.width / 2 - 40, locations.waitingArea.y + locations.waitingArea.height / 2 - 40, 20, 20);


            // Desenha a área geral dos especialistas
            ctx.fillStyle = '#fffacd'; // Cor amarela clara para a área
            ctx.fillRect(locations.specialistsArea.x, locations.specialistsArea.y, locations.specialistsArea.width, locations.specialistsArea.height);
            ctx.strokeStyle = '#000'; // Borda preta
            ctx.strokeRect(locations.specialistsArea.x, locations.specialistsArea.y, locations.specialistsArea.width, locations.specialistsArea.height);
            ctx.fillStyle = '#000'; // Cor do texto preta
            ctx.fillText(locations.specialistsArea.label, locations.specialistsArea.x + locations.specialistsArea.width / 2, locations.specialistsArea.y - 10); // Rótulo da área de especialistas

            // Desenha as salas dos especialistas e seus rótulos
            locations.specialists.forEach(spec => {
                // Desenha a sala
                ctx.fillStyle = '#f0f0f0'; // Cor clara para o chão da sala
                ctx.fillRect(spec.roomX, spec.roomY, spec.roomWidth, spec.roomHeight);
                ctx.strokeStyle = '#000'; // Borda preta para a sala
                ctx.strokeRect(spec.roomX, spec.roomY, spec.roomWidth, spec.roomHeight);

                // Desenha um ponto representando o profissional na sala
                 ctx.fillStyle = spec.color; // Cor do especialista
                 ctx.beginPath();
                 ctx.arc(spec.roomX + spec.roomWidth / 2, spec.roomY + spec.roomHeight / 2, 5, 0, Math.PI * 2); // Ponto no centro da sala
                 ctx.fill();


                // Desenha o nome do especialista (rótulo da sala)
                ctx.fillStyle = '#000'; // Cor do texto preta
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(spec.name, spec.roomX + spec.roomWidth / 2, spec.roomY + spec.roomHeight + 10); // Nome abaixo da sala
            });

             // Desenha o personagem (forma humana simplificada) na cena do hospital
            drawCharacter(character.x, character.y, character.color, character.animationFrame);


            // Desenha os rótulos das localizações principais
            ctx.fillStyle = '#000';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(locations.start.label, locations.start.x, locations.start.y + 30); // Rótulo do início
            ctx.fillText(locations.hospitalEntrance.label, locations.hospitalEntrance.x, locations.hospitalEntrance.y + 30); // Rótulo da porta de entrada
             ctx.fillText(locations.hospitalExit.label, locations.hospitalExit.x, locations.hospitalExit.y + 30); // Rótulo da porta de saída


        } else if (simulationState === 'inConsultation') {
            // Desenha a cena da sala de consulta
            ctx.fillStyle = consultationRoom.floorColor; // Cor do chão
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

            ctx.fillStyle = consultationRoom.wallColor; // Cor das paredes
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height * 0.8); // Desenha a parede


            // Desenha a mesa do doutor
            ctx.fillStyle = consultationRoom.deskColor;
            ctx.fillRect(consultationRoom.desk.x, consultationRoom.desk.y, consultationRoom.desk.width, consultationRoom.desk.height);

            // Desenha as cadeiras
            ctx.fillStyle = consultationRoom.chairColor;
            ctx.fillRect(consultationRoom.patientChair.x, consultationRoom.patientChair.y, consultationRoom.patientChair.width, consultationRoom.patientChair.height); // Cadeira do paciente
            ctx.fillRect(consultationRoom.psychologistChair.x, consultationRoom.psychologistChair.y, consultationRoom.psychologistChair.width, consultationRoom.psychologistChair.height); // Cadeira do psicólogo

            // Desenha o tapete
             ctx.fillStyle = consultationRoom.rugColor;
             ctx.fillRect(consultationRoom.rug.x, consultationRoom.rug.y, consultationRoom.rug.width, consultationRoom.rug.height);


            // Desenha a janela (simples)
            ctx.fillStyle = consultationRoom.windowColor;
            ctx.fillRect(consultationRoom.window.x, consultationRoom.window.y, consultationRoom.window.width, consultationRoom.window.height);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(consultationRoom.window.x, consultationRoom.window.y, consultationRoom.window.width, consultationRoom.window.height); // Borda da janela


            // Desenha o vaso de flores (simples)
            ctx.fillStyle = consultationRoom.vaseColor;
            ctx.fillRect(consultationRoom.vase.x, consultationRoom.vase.y, consultationRoom.vase.width, consultationRoom.vase.height); // Vaso
            ctx.fillStyle = consultationRoom.flowerColor;
            ctx.beginPath();
            ctx.arc(consultationRoom.vase.x + consultationRoom.vase.width / 2, consultationRoom.vase.y, 10, 0, Math.PI * 2);
            ctx.fill();


            // Desenha o personagem (paciente) na cadeira
            // Posição ajustada para sentar na cadeira do paciente
            const patientX = consultationRoom.patientChair.x + consultationRoom.patientChair.width / 2;
            const patientY = consultationRoom.patientChair.y + consultationRoom.patientChair.height / 2 + character.legHeight / 2; // Ajusta a base para sentar
            drawCharacter(patientX, patientY, character.color);

            // Desenha o psicólogo na cadeira
            // Posição ajustada para sentar na cadeira do psicólogo
            const psychologistX = consultationRoom.psychologistChair.x + consultationRoom.psychologistChair.width / 2;
            const psychologistY = consultationRoom.psychologistChair.y + consultationRoom.psychologistChair.height / 2 + psychologist.legHeight / 2; // Ajusta a base para sentar
            drawCharacter(psychologistX, psychologistY, psychologist.color, false, true); // Passa true para indicar que é o psicólogo

             // Adiciona o nome do especialista na cena de consulta
             if (locations.selectedSpecialist) {
                 ctx.fillStyle = '#000';
                 ctx.font = '24px sans-serif'; // Fonte maior para o título da sala
                 ctx.textAlign = 'center';
                 ctx.fillText(`Consultório: ${locations.selectedSpecialist.name}`, gameCanvas.width / 2, 80); // Título da sala
             }

             // Adiciona um título geral para a cena de consulta
             ctx.fillStyle = '#000';
             ctx.font = '18px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText("Cena de Consulta", gameCanvas.width / 2, 30);

        }
        // No estado 'customizing', o canvas é limpo e nada mais é desenhado.
    }

    // Função para desenhar o personagem (ou psicólogo) com animação de caminhada
    function drawCharacter(x, y, color, frame = 0, isPsychologist = false) {
        ctx.fillStyle = color;

        // Desenha as pernas com base no frame da animação
        const legWidth = character.width / 2 - 2;
        const legHeight = character.legHeight;
        let legOffset1 = 0;
        let legOffset2 = 0;

        if (!isPsychologist && character.isMoving) { // Aplica animação apenas ao personagem principal quando em movimento
            legOffset1 = (Math.floor(frame / character.animationSpeed) % 2 === 0) ? 2 : -2;
            legOffset2 = (Math.floor(frame / character.animationSpeed) % 2 === 0) ? -2 : 2;
        }


        ctx.fillRect(x - character.width / 2, y - legHeight - legOffset1, legWidth, legHeight); // Perna esquerda
        ctx.fillRect(x + character.width / 2 - legWidth, y - legHeight - legOffset2, legWidth, legHeight); // Perna direita


        // Desenha o corpo
        ctx.fillRect(x - character.width / 2, y - character.legHeight - character.height, character.width, character.height);

        // Desenha a cabeça
        ctx.beginPath();
        ctx.arc(x, y - character.legHeight - character.height - character.headRadius, character.headRadius, 0, Math.PI * 2);
        ctx.fill();

         // Adiciona um pequeno detalhe para diferenciar o psicólogo (opcional)
        if (isPsychologist) {
            ctx.fillStyle = '#000'; // Cor preta para o detalhe
            ctx.fillRect(x - 5, y - character.legHeight - character.height - character.headRadius - 5, 10, 3); // Linha acima da cabeça
        }
    }


    // Função para mover o personagem em direção a um ponto alvo
    function moveCharacter() {
        // O personagem só se move se estiver em um estado de movimento e não na consulta ou finalizado
        if (!character.isMoving || simulationState === 'inConsultation' || simulationState === 'finished') return;

        // Calcula a distância e a direção para o alvo
        const dx = character.targetX - character.x;
        const dy = character.targetY - character.y;
        const distance = Math.sqrt(dx * dx + dy * dy); // Distância euclidiana

        // Verifica se o personagem chegou perto o suficiente do alvo
        if (distance < character.speed) {
            character.x = character.targetX; // Define a posição exatamente no alvo
            character.y = character.targetY;
            character.isMoving = false; // Para o movimento
            handleStateChange(); // Chama a função para lidar com a mudança de estado
        } else {
            // Move o personagem na direção do alvo
            character.x += (dx / distance) * character.speed;
            character.y += (dy / distance) * character.speed;

            // Atualiza o frame da animação de caminhada
            character.animationFrame++;
        }
    }

    // Função para definir um novo ponto alvo para o personagem
    function setCharacterTarget(x, y) {
        character.targetX = x;
        character.targetY = y;
        character.isMoving = true; // Inicia o movimento
    }

    // Função para exibir uma mensagem na caixa de mensagem
    function showMessage(message, duration = 3000) { // Adicionado duração opcional
        messageBox.textContent = message;
        messageBox.style.display = 'block'; // Torna a caixa de mensagem visível

        // Esconde a mensagem após a duração especificada
        if (duration > 0) {
            setTimeout(() => {
                hideMessage();
            }, duration);
        }
    }

    // Função para esconder a caixa de mensagem
    function hideMessage() {
        messageBox.style.display = 'none'; // Esconde a caixa de mensagem
    }

    // Função para lidar com as mudanças de estado da simulação
    function handleStateChange() {
        console.log("handleStateChange called, current state:", simulationState); // Log para handleStateChange
        switch (simulationState) {
            case 'movingToEntrance':
                // Quando o personagem chega à porta de entrada
                simulationState = 'atReception'; // Muda o estado para na recepção
                showMessage('Chegou à recepção.'); // Exibe mensagem
                // Move para a posição na frente do balcão da recepção
                setCharacterTarget(locations.receptionArea.x, locations.receptionArea.y + locations.receptionArea.height / 2 + character.legHeight); // Ajusta a posição para ficar na frente do balcão
                break;

            case 'atReception':
                // Quando o personagem chega na recepção, simula interação
                 showMessage('Falando com a recepcionista...');
                 setTimeout(() => {
                    hideMessage();
                    // Simula a obtenção de informações ou direcionamento
                    showMessage('Direcionado para a área de espera.');
                    setCharacterTarget(locations.waitingArea.x, locations.waitingArea.y + locations.waitingArea.height / 2 + character.legHeight); // Define o alvo para a área de espera
                    simulationState = 'movingToWaitingArea'; // Próximo estado: movendo para área de espera
                 }, 2000); // Simula o tempo de interação na recepção
                 break;

            case 'movingToWaitingArea':
                // Quando o personagem chega na área de espera
                 showMessage('Dirigindo-se para a área de espera...');
                 setTimeout(() => {
                    hideMessage();
                    simulationState = 'atWaitingArea'; // Próximo estado: na área de espera
                    showMessage('Chegou à área de espera. Aguardando para a triagem...');
                 }, 1000); // Pequeno atraso antes de considerar que chegou na área de espera
                 break;

            case 'atWaitingArea':
                // Quando o personagem chega na área de espera, simula o tempo de espera
                // A transição para a triagem é feita por um timer
                setTimeout(() => {
                    hideMessage();
                    setCharacterTarget(locations.triage.x, locations.triage.y + 50); // Define o alvo para a triagem (ajustado para o centro da área)
                    simulationState = 'movingToTriage'; // Próximo estado: movendo para a triagem
                    showMessage('Chamado para a triagem.');
                }, 3000); // Simula o tempo de espera (3 segundos)
                break;

            case 'movingToTriage':
                // Quando o personagem chega na triagem
                 showMessage('Dirigindo-se para a triagem...'); // Atualiza a mensagem
                 setTimeout(() => {
                    hideMessage();
                    simulationState = 'atTriage'; // Próximo estado: na triagem
                 }, 1000); // Tempo de espera reduzido antes de considerar que chegou na triagem
                break;

            case 'atTriage':
                // Quando o personagem chega na triagem, simula a avaliação
                showMessage('Chegou à triagem. Avaliando o melhor especialista...');
                // Muda a cor temporariamente para indicar avaliação
                const assessmentColor = '#FFFF00'; // Cor amarela para avaliação
                const originalCharColor = character.color; // Salva a cor atual
                character.color = assessmentColor;
                drawScene(); // Redesenha para mostrar a cor de avaliação

                setTimeout(() => {
                    // Restaura a cor original do personagem
                    character.color = originalCharColor;

                    // Simula a seleção de um caso e o encaminhamento para o especialista
                    const cases = Object.keys(caseToSpecialist);
                    const randomCase = cases[Math.floor(Math.random() * cases.length)];
                    const recommendedSpecialistName = caseToSpecialist[randomCase];

                    // Encontra o objeto do especialista selecionado
                    locations.selectedSpecialist = locations.specialists.find(spec => spec.name === recommendedSpecialistName);

                    // A mensagem de encaminhamento fica travada aqui
                    showMessage(`Avaliação completa. Encaminhado para: ${locations.selectedSpecialist.name}`); // Mensagem de encaminhamento

                    simulationState = 'movingToSpecialistRoom'; // Muda para o estado de movimento para a sala do especialista

                    // Define o alvo para o centro da sala do especialista selecionado
                    const targetX = locations.selectedSpecialist.roomX + locations.selectedSpecialist.roomWidth / 2;
                    const targetY = locations.specialistsArea.height / 2 + character.legHeight / 2; // Ajusta para a base do personagem
                    setCharacterTarget(targetX, targetY);

                    // Não exibe mensagem adicional aqui, a mensagem de encaminhamento permanece

                }, 5000); // Tempo de simulação da avaliação (5 segundos)
                break;

            case 'movingToSpecialistRoom':
                 // Quando o personagem chega ao especialista (na sala)
                 console.log("Arrived at specialist room, transitioning to inConsultation"); // Log de chegada ao especialista
                 hideMessage(); // Esconde a mensagem anterior (a de encaminhamento)
                 simulationState = 'inConsultation'; // Muda para o estado de consulta
                 // Não precisa definir um novo alvo aqui, pois a cena de consulta é estática
                 drawScene(); // Desenha a cena de consulta
                 // Exibe o nome do especialista na caixa de mensagem AGORA
                 showMessage(`Iniciando consulta com ${locations.selectedSpecialist.name}.`);

                 // Adiciona um timer para sair da cena de consulta após um tempo
                 setTimeout(() => {
                     hideMessage();
                     simulationState = 'exitingConsultation'; // Muda para o estado de saída da consulta
                     showMessage('Consulta finalizada. Saindo do consultório.');
                     // Define o alvo para a nova saída do hospital no lado direito
                     setCharacterTarget(locations.hospitalExit.x, locations.hospitalExit.y);
                 }, 8000); // Tempo na cena de consulta (8 segundos)
                 break;

            case 'inConsultation':
                // O personagem está na sala de consulta
                // A simulação permanece neste estado até o timer acionar a saída
                // A mensagem com o nome do especialista já está visível
                break;

            case 'exitingConsultation':
                 // Quando o personagem sai da sala de consulta e se move para a saída
                 console.log("Exiting consultation, moving to exit"); // Log de saída da consulta
                 showMessage('Dirigindo-se para a saída do hospital...');
                 setTimeout(() => {
                     hideMessage();
                     simulationState = 'movingToExit'; // Próximo estado: movendo para a saída
                     // O alvo já foi definido no estado anterior (movingToSpecialistRoom ou inConsultation -> hospitalExit)
                 }, 1000); // Pequeno atraso antes de considerar que está movendo para a saída
                 break;

            case 'movingToExit':
                 // Quando o personagem chega à saída do hospital
                 console.log("Arrived at exit, simulation finished"); // Log de chegada à saída
                 showMessage('Dirigindo-se para a saída...');
                 setTimeout(() => {
                     hideMessage();
                     simulationState = 'finished'; // Estado final
                     showMessage('Saiu do hospital. Simulação concluída.');
                     // Opcional: Resetar a simulação ou mostrar uma mensagem final
                 }, 1500); // Tempo para chegar à saída
                 break;

             case 'finished':
                 // Simulação concluída, aguardando possível reset ou nova interação
                 break;


            case 'atSpecialist':
                 // Este estado não é mais usado diretamente
                break;

            case 'customizing':
                // Estado inicial enquanto o usuário personaliza
                // Nenhuma ação de movimento automática neste estado.
                break;
        }
    }

    // O loop principal do jogo (animação)
    function gameLoop() {
        // console.log("gameLoop running, state:", simulationState, "isMoving:", character.isMoving); // Log para o gameLoop (pode gerar muitas mensagens)
        // A função moveCharacter só é chamada se estiver em um estado de movimento e não na consulta ou finalizado
        if (character.isMoving && simulationState !== 'inConsultation' && simulationState !== 'finished') {
             moveCharacter(); // Atualiza a posição do personagem se ele estiver se movendo
        } else if (!character.isMoving && simulationState !== 'customizing' && simulationState !== 'inConsultation' && simulationState !== 'finished') {
             // Se chegou ao destino em um estado que não é de movimento contínuo, aciona a mudança de estado
             handleStateChange();
        }
        // Desenha a cena apenas se não estiver no estado de personalização
        if (simulationState !== 'customizing') {
            drawScene(); // Redesenha a cena
        }
        requestAnimationFrame(gameLoop); // Solicita o próximo frame da animação
    }


    // --- Funções de Interação da IA (Adaptadas para iniciar diretamente) ---

    // Função para exibir uma mensagem na caixa de mensagem
    function showMessage(message, duration = 3000) { // Adicionado duração opcional
        messageBox.textContent = message;
        messageBox.style.display = 'block'; // Torna a caixa de mensagem visível

        // Esconde a mensagem após a duração especificada
        if (duration > 0) {
            setTimeout(() => {
                hideMessage();
            }, duration);
        }
    }

    // Função para esconder a caixa de mensagem
    function hideMessage() {
        messageBox.style.display = 'none'; // Esconde a caixa de mensagem
    }

    // Lógica para simular a interação da IA no início da simulação
    function startAIGuidedSimulation() {
        // Mensagem de boas-vindas inicial para a simulação
        showMessage('Olá! Eu sou a Google IA. Bem-vindo à simulação do Hospital Psiquiátrico.', 5000);

        // Mensagem para iniciar a jornada após um pequeno atraso
        setTimeout(() => {
             showMessage('Iniciando a jornada para a entrada do hospital...', 5000);
        }, 6000); // Espera 6 segundos após a primeira mensagem
    }


    // --- Inicialização da Simulação ---

    // Inicia a simulação 2D e a interação da IA quando o DOM estiver carregado
    startAIGuidedSimulation(); // Inicia a sequência de mensagens da IA para a simulação
    setCharacterTarget(locations.hospitalEntrance.x, locations.hospitalEntrance.y); // Define o primeiro alvo (entrada do hospital)
    gameLoop(); // Inicia o loop de animação que controla o movimento e desenho


}); // Fim do DOMContentLoaded listener
