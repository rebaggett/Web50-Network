let followersFunction = false;
let followingFunction = false;
let likeFunction = false;

document.addEventListener('DOMContentLoaded', function() {
   
    // Change profile URL to username
    const profile_link = document.querySelector('#user-profile-link');
    const user_id = profile_link.dataset.id;
    if (window.location.href.endsWith(`/${user_id}`)) {
        let username = profile_link.dataset.username;
        username = username.replace(/ /g,"_");
        window.history.pushState({username: username}, "", `${username}`);
        const popStateEvent = new PopStateEvent('popstate', {username: username});
        this.dispatchEvent(popStateEvent);
    }

    // Add event listeners
    document.querySelector('#new-post-button').addEventListener('click', () => create_post());
    document.getElementById('followers-div').addEventListener('click', ()=> get_followers(user_id));
    // document.getElementById('following-div').addEventListener('click', ()=> get_following(user_id));
    document.getElementById('popup-close').addEventListener('click', ()=> close_popup());

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

function get_followers(id){
    // Identify popup elements
    popupDiv = document.getElementById('popup-div');
    popupHead = document.getElementById('popup-head')
    popupBody = document.getElementById('popup-body')

    // If function has already been run, make sure it's visible then end
    if (followersFunction === true) {
        if (popupDiv.style.visibility === 'hidden') {
            popupDiv.style.visibility = 'visible';
        }
        return false;
    }
    // If non-follower elements populate the popup, remove them and set other functions to false
    else if (followingFunction === true || likeFunction === true) {
        headText = popupHead.nodeType === 3;
        headText.remove();
        while(popupBody.lastChild) {
            popupBody.removeChild(popupBody.lastChild);
        }
        followingFunction = false;
        likeFunction = false;
    }

    // Get followers from API
    fetch(`/${id}/followers`)
    .then(response => response.json())
    .then(followers => {
        console.log(followers);

        // Shows dialog box and set header info to Followers
        popupDiv.style.visibility = 'visible';
        popupHead.prepend('Followers');

        for (const follower of followers) {

            // Create container with image and username for each follower
            const followerLink = document.createElement('a')
            const followerDiv = document.createElement('div');
            const imageDiv = document.createElement('div');
            const followerImage = document.createElement('img');
            const followerName = document.createElement('span');

            // Clicking anywhere on the div will load follower's profile
            followerLink.setAttribute('href', `/${follower.id}`);
            followerLink.classList.add('follower-container');
            followerDiv.classList.add('follower-div');

            // Set image attributes
            imageDiv.classList.add('follower-img-div');
            followerImage.setAttribute('src', `${follower.image}`);
            followerImage.setAttribute('id', `follower${follower.id}-img`);
            followerImage.className = 'follower-img';

            // Set name attributes
            followerUsername = follower.username.replace(/ /g,"-");
            followerName.setAttribute('id', `follower-${followerUsername}`);
            followerName.className = 'follower-username';
            followerName.innerHTML = `${follower.username}`;

            //Append to popup
            followerDiv.appendChild(imageDiv);
            imageDiv.appendChild(followerImage);
            followerDiv.appendChild(followerName);
            followerLink.appendChild(followerDiv);
            popupBody.appendChild(followerLink);

        }
        // Do not run function again unless box is closed
        followersFunction = true;
    })
}

function close_popup(){
    popupDiv = document.getElementById('popup-div');
    popupDiv.style.visibility = 'hidden';
}