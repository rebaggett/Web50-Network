document.addEventListener('DOMContentLoaded', function() {
   
    // Change profile URL to username
    const profile_link = document.querySelector('#user-profile-link');
    const user_id = profile_link.href;
    console.log(user_id);
    if (window.location.href === `${user_id}`) {
        let username = profile_link.dataset.username;
        username = username.replace(/ /g,"_");
        window.history.pushState({username: username}, "", `${username}`);
        const popStateEvent = new PopStateEvent('popstate', {username: username});
        this.dispatchEvent(popStateEvent);
    }

    // Add event listeners
    document.querySelector('#new-post-button').addEventListener('click', () => create_post());
    document.getElementById('followers-div').addEventListener('click', ()=> get_followers(user_id));
    document.getElementById('following-div').addEventListener('click', ()=> get_following(user_id));

})

function create_post(){

    const current_author = document.querySelector('#user-profile-link');
    const current_content = document.querySelector('#new-post-content');

    fetch('/post', {
        method: 'POST',
        headers: {'X-CSRFToken': get_cookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            author: current_author.textContent,
            content: current_content.value
        })
    })
    .then(response => response.json())
    .then(post => {
        // Create div for new post
        const createdPost = document.createElement('div');
        createdPost.classList.add('new-post', 'post-div');

        // Create elements for new post div
        const author = document.createElement('p');
        const content = document.createElement('p');
        const timestamp = document.createElement('p');
        const likes = document.createElement('p');

        // Set classes for new elements
        author.setAttribute('class', 'post-author');
        content.setAttribute('class', 'post-content');
        timestamp.setAttribute('class', 'post-timestamp');
        likes.setAttribute('class', 'post-likes');

        // Set values for new elements
        author.innerHTML = post.author;
        content.innerHTML = post.content;
        timestamp.innerHTML = post.timestamp;
        likes.innerHTML = '0';

        // Add elements to created post and prepend created post to post list div
        createdPost.appendChild(author);
        createdPost.appendChild(content);
        createdPost.appendChild(timestamp);
        createdPost.appendChild(likes);
        document.querySelector('#post-list').prepend(createdPost);

        current_content.value = '';
        createdPost.style.animationPlayState = 'running';
        
    })
}

function get_cookie(cookie){
    const name = cookie + '=';
    const allDecoded = decodeURIComponent(document.cookie);
    const allArray = allDecoded.split(';');

    let result;
    allArray.forEach(val => {
        if (val.indexOf(name) === 0) result=val.substring(name.length);
    })
    return result;
}

function get_followers()