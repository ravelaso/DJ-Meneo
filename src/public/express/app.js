document.addEventListener('DOMContentLoaded', () => {
    const statusContainer = document.getElementById('status-container');
  
    // Fetch bot status data from the /status endpoint
    fetch('/status')
      .then(response => response.json())
      .then(data => {
        // Format the data and display it on the webpage
        const formattedStatus = `
          <p><strong>Bot Tag:</strong> ${data.botTag}</p>
          <p><strong>Guild Count:</strong> ${data.guildCount}</p>
          <p><strong>User Count:</strong> ${data.userCount}</p>
          <p><strong>Memory Usage:</strong> ${JSON.stringify(data.memoryUsage)}</p>
          <p><strong>Uptime:</strong> ${data.uptime} ms</p>
        `;
  
        statusContainer.innerHTML = formattedStatus;
      })
      .catch(error => {
        console.error('Error fetching bot status:', error);
        statusContainer.innerHTML = '<p>Error fetching bot status</p>';
      });
  });
  