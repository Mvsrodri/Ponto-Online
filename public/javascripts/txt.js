
//Fetch é responsavel por carregar o arquivo txt
fetch('/Txt/descricao.txt', {
    cache: 'reload' // defini o tipo de cache
}).then(function(response) {
    if ( response.ok ) {
        // Retorna o texto do arquivo txt
        return response.text();
    }
    // em caso de  erros
    throw new Error('Erro: ' + response.status);
}).then(function(text) {
    // buscar elemento (div) com id txt
    var el = document.getElementById('txt');
    // adicionar resultado (objeto para string)
    el.innerHTML = el.innerHTML += '<br>' + text;
}).catch(function(error) {
    // caso haja um erro é tratado aqui
    console.error('Erro ao carregar o arquivo de texto:', error);
});