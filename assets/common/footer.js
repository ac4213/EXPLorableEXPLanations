document.addEventListener('DOMContentLoaded', function() {
    // Create footer element if it doesn't exist
    let footer = document.querySelector('footer');
    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
    // Set the footer content
    footer.innerHTML = `
    <p class="small-caps">explorable explanations: discovering engineering through interactive learning</p>    
    <p>&copy; Dr. Arnaldo Delli Carri PhD CEng MIMechE SFHEA</p>
        <p>Coventry University, United Kingdom</p>
        <div class="footer-links">
            <a href="/index.html">Home</a> |
            <a href="/about.html">About</a> |
            <a href="/author.html">About the Author</a> |
            <a href="mailto:ac4213@coventry.ac.uk?subject=ExplExpl%20Website%20Feedback">Contact</a>
        </div>
        <p>Found a bug? <a href="mailto:ac4213@coventry.ac.uk?subject=ExplExpl%20Bug%20Report">Let me know!</a></p>
    `;
});