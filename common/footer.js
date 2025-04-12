document.addEventListener('DOMContentLoaded', function() {
    // Create footer element if it doesn't exist
    let footer = document.querySelector('footer');
    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
    // Set the footer content
    footer.innerHTML = `
        <p>&copy; Dr. Arnaldo Delli Carri Ph.D. CEng MIMechE SFHEA</p>
        <p class="small-caps">explorable explanations: discovering engineering through interactive learning</p>
        <div class="footer-links">
            <a href="mailto:ac4213@coventry.ac.uk?subject=ExplExpl%20Website%20Feedback">Contact</a> | 
            <a href="/index.html">Home</a>
        </div>
        <p>Coventry University, United Kingdom</p>
        <p>Found a bug? <a href="mailto:ac4213@coventry.ac.uk?subject=ExplExpl%20Bug%20Report">Let me know!</a></p>
    `;
});