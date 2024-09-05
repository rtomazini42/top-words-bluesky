let AllText = '';

document.getElementById('fetchFeedButton').addEventListener('click', function() {
  const username = document.getElementById('username').value.trim();
  
  if (username) {
    const token = '<TOKEN>'; 
    const limit = 100; 
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${username}&limit=${limit}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      const feed = data.feed;
      const feedContainer = document.getElementById('feedResult');
      feedContainer.innerHTML = ''; 

      if (feed.length === 0) {
        feedContainer.innerHTML = '<p>Não foram encontradas postagens para este usuário.</p>';
      } else {
        AllText = ''; 

        feed.forEach(post => {
          const { record } = post.post; 
          const text = record.text ? record.text : 'Conteúdo não disponível';
          AllText += text + ' '; 
        });

        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(drawBarChart);
      }

      console.log(AllText); 
    })
    .catch(error => {
      console.error('Erro:', error);
      document.getElementById('feedResult').innerHTML = `<p>Erro ao buscar feed: ${error.message}</p>`;
    });
  } else {
    alert('Por favor, insira um nome de usuário.');
  }
});

function drawBarChart() {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Palavra');
  data.addColumn('number', 'Frequência');

  const words = processText(AllText);

  const topWords = words.slice(0, 10);

  data.addRows(topWords);

  const chart = new google.visualization.BarChart(document.getElementById('barChartContainer'));

  chart.draw(data, {
    title: 'Top 10 Palavras mais Frequentes',
    hAxis: { title: 'Frequência' },
    vAxis: { title: 'Palavra' },
    backgroundColor: '#ffffff'
  });
}

function processText(text) {
  const stopwords = new Set([
    'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'as', 'com', 'da', 'das', 'de', 'do', 'dos',
    'ela', 'ele', 'eles', 'e','em', 'entre', 'era', 'es', 'essa', 'essas', 'este', 'esta', 'estes', 'estas',
    'eu', 'já', 'lhe', 'lo', 'me', 'mais', 'mas', 'na', 'nas', 'no', 'nos', 'nós', 'o', 'os', 'para', 'pe',
    'por', 'qual', 'quando', 'que', 'quem', 'se', 'sua', 'suas', 'um', 'uma', 'uns', 'uma', 'você', 'vos', 
    'é', 'está', 'estão', 'estava', 'ter', 'tem', 'têm', 'também', 'outros', 'um', 'uma', 'uns', 'umas', 
    'muito', 'muitos', 'muita', 'muitas', 'pelo', 'pela', 'pelo', 'pela', 'sobre', 'à', 'às', 'àqueles'
  ]);
  
  const wordCounts = {};
  const words = text.toLowerCase().match(/\w+/g);
  
  if (words) {
    words.forEach(word => {
      if (!stopwords.has(word) || word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  }


  return Object.entries(wordCounts).map(([word, count]) => [word, count])
    .sort((a, b) => b[1] - a[1]); 
}
