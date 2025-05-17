// Log para confirmar que o script está sendo carregado
console.log("menu.style.js loaded");

// Obtém referências para os elementos do HTML
// Garante que o DOM esteja completamente carregado antes de tentar obter os elementos
document.addEventListener('DOMContentLoaded', () => {
    // Obtém referências para os elementos do HTML
    const characterPreviewImage = document.getElementById('character-preview');
    const skinColorSelect = document.getElementById('skin-color');
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const startButton = document.getElementById('start-button'); // Referência ao botão Iniciar
    const messageBox = document.getElementById('message-box'); // Referência à caixa de mensagem
    const customizationMenu = document.getElementById('customization-menu'); // Referência ao menu
    // A referência ao gameCanvas não é estritamente necessária neste script, pois estamos redirecionando.
    // const gameCanvas = document.getElementById('gameCanvas');


    // Mapeamento de seleção para URLs das imagens na pasta 'imagens'
    // Ajustado para remover a opção 'blue' e usar os nomes de arquivo corretos
    const characterImages = {
        male: {
            // Assumindo que o nome do arquivo para homem branco é homenBranco.png
            white: 'imagens/homen_branco..png',
            // Assumindo que o nome do arquivo para homem preto é homenPreto.png
            black: 'imagens/homenPreto.png'
        },
        female: {
            // Assumindo que o nome do arquivo para mulher branca é mulherBranca.png
            white: 'imagens/mulherBranca.png',
            // Assumindo que o nome do arquivo para mulher preta é mulherPreta.png
            black: 'imagens/mulherPreta.png'
        }
    };

    // Função para atualizar a imagem de pré-visualização com base nas seleções
    function updateCharacterPreview() {
        const selectedGender = document.querySelector('input[name="gender"]:checked').value;
        const selectedSkinColor = skinColorSelect.value;

        // Obtém a URL da imagem do mapeamento
        const imageUrl = characterImages[selectedGender][selectedSkinColor];

        // --- Lógica para gerar o texto alternativo (alt text) com concordância (MODIFICADO) ---
        let altText = 'Preview de Avatar';
        if (selectedGender === 'male') {
            altText += ' Homem';
            if (selectedSkinColor === 'white') {
                altText += ' Branco'; // Homem Branco
            } else { // black
                altText += ' Preto'; // Homem Preto
            }
        } else { // female
            altText += ' Mulher';
            if (selectedSkinColor === 'white') {
                altText += ' Branca'; // Mulher Branca
            } else { // black
                altText += ' Preta'; // Mulher Preta
            }
        }
        // --- Fim da lógica do alt text ---


        // Define o src da imagem de pré-visualização
        characterPreviewImage.src = imageUrl;
        // Define o alt da imagem com o texto gerado
        characterPreviewImage.alt = altText;


        console.log(`Preview atualizado: Gênero: ${selectedGender}, Cor da Pele: ${selectedSkinColor}, URL: ${imageUrl}, Alt Text: "${altText}"`);
    }

    // Listener para mudanças na seleção de gênero
    genderRadios.forEach(radio => {
        radio.addEventListener('change', updateCharacterPreview);
    });

    // Listener para mudanças na seleção de cor de pele
    skinColorSelect.addEventListener('change', updateCharacterPreview);


    // Função para mostrar mensagens na caixa de mensagem
    function showMessage(message, duration = 3000) {
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

    // Lógica para simular a interação da IA no início da personalização
    function startAIGuidedCustomization() {
        // Mensagem de boas-vindas inicial para a personalização
        showMessage('Olá! Eu sou a Google IA. Por favor, personalize seu avatar antes de iniciar a simulação.', 5000);

        // Mensagem para encorajar o usuário a personalizar após um pequeno atraso
        setTimeout(() => {
             showMessage('Escolha o gênero e a cor da pele que preferir.', 5000);
        }, 6000); // Espera 6 segundos após a primeira mensagem
    }


    // Listener para o botão Iniciar Simulação
    startButton.addEventListener('click', () => {
        console.log("Botão Iniciar clicado.");
        const selectedGender = document.querySelector('input[name="gender"]:checked').value;
        const selectedSkinColor = skinColorSelect.value;
        console.log(`Opções selecionadas: Gênero: ${selectedGender}, Cor da Pele: ${selectedSkinColor}`);

        // --- REDIRECIONA PARA entradaDoHospital.html PASSANDO OS DADOS NA URL ---
        // Obtém a URL da imagem com base nas seleções
        const imageUrl = characterImages[selectedGender][selectedSkinColor];
        // Codifica a URL da imagem para garantir que caracteres especiais não causem problemas
        const encodedImageUrl = encodeURIComponent(imageUrl);

        console.log("Redirecionando para entradaDoHospital.html com URL da imagem:", imageUrl); // Log da URL que será passada

        // Redirecionamento para entradaDoHospital.html com os parâmetros na URL
        window.location.replace(`entradaDoHospital.html?gender=${selectedGender}&skin=${selectedSkinColor}&imageUrl=${encodedImageUrl}`);
        // --- FIM DO REDIRECIONAMENTO ---

        // A lógica anterior de mostrar/esconder elementos e iniciar a simulação 2D
        // foi removida, pois a página será completamente recarregada em entradaDoHospital.html.
    });


    // Inicializa a pré-visualização da imagem e inicia a interação guiada pela IA quando o DOM estiver carregado
    updateCharacterPreview(); // Atualiza a imagem inicial
    startAIGuidedCustomization(); // Inicia a sequência de mensagens da IA

}); // Fim do DOMContentLoaded listener
