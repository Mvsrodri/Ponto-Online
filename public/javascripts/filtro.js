document.addEventListener('DOMContentLoaded', () => {
    const selectOrdenacao = document.getElementById('ordenarPorData');
  
    selectOrdenacao.addEventListener('change', (event) => {
        const ordenacao = event.target.value;
        const url = new URL(window.location.href);
        url.searchParams.set('ordenacao', ordenacao);
      
        // Adicione o parâmetro "ordem" à URL com valor "decrescente" quando a ordenação for "desc"
        if (ordenacao === 'desc') {
          url.searchParams.set('ordem', 'decrescente');
        }
      
        window.location.href = url.href; // Redirecionar para a mesma página com os parâmetros de consulta
      });
  });