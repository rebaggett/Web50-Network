let textClick = false;
let editContent = false;
let followersFunction = false;
let followingFunction = false;
let likeFunction;
let imgClick = false;

document.addEventListener('DOMContentLoaded', function() {
   
    // Change profile URL to username
    const profile_link = document.querySelector('#user-profile-link');
    const user_id = profile_link.dataset.id;
    // if (window.location.href.endsWith(`/${user_id}`)) {
    //     let username = profile_link.dataset.username;
    //     username = username.replace(/ /g,"_");
    //     window.history.pushState({username: username}, "", `${username}`);
    //     const popStateEvent = new PopStateEvent('popstate', {username: username});
    //     this.dispatchEvent(popStateEvent);
    // }

    // Add event listeners
    document.querySelector('#new-post-button').addEventListener('click', () => create_post());
    document.getElementById('popup-close').addEventListener('click', ()=> close_popup());

})

function create_post(){

    const current_author = document.querySelector('#user-profile-link').dataset.id;
    const current_content = document.querySelector('#new-post-content');

    fetch('/post', {
        method: 'POST',
        headers: {'X-CSRFToken': get_cookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            author: current_author,
            content: current_content.value
        })
    })
    .then(response => response.json())
    .then(post => {
        console.log(post);
        // Create div for new post
        const createdPost = document.createElement('div');
        createdPost.classList.add('new-post', 'post-div');
        createdPost.setAttribute('id', `post${post.id}-div`);

        // Create elements for new post div
        const author = document.createElement('a');
        const authorImg = document.createElement('img');
        const authorText = document.createElement('span');
        const timestamp = document.createElement('span');
        const content = document.createElement('p');
        const editArea = document.createElement('textarea');
        const editBtn = document.createElement('span');
        const likes = document.createElement('span');
        const likeButton = document.createElement('span');
        const likeLength = document.createElement('span');

        // Set author information
        author.setAttribute('class', 'post-author');
        author.setAttribute('href', `/${current_author}`);
        authorImg.setAttribute('class', 'post-author-image');
        authorImg.setAttribute('src', `${post.authorimage}`);
        authorText.innerHTML = post.author;

        // Set timestamp information
        timestamp.setAttribute('class', 'post-timestamp');
        timestamp.innerHTML = `roared on ${post.timestamp}:`;
        
        // Set content information
        content.setAttribute('class', 'post-content');
        content.innerHTML = post.content;

        // Set edit information
        editArea.setAttribute('class', 'post-content-edit');
        editArea.value = post.content;
        editBtn.setAttribute('class', 'post-edit');
        editBtn.setAttribute('role', 'button');
        editBtn.addEventListener('click', ()=>edit_content(post.id, current_author));
        editBtn.innerHTML = 'Edit';
        
        // Set likes information
        likes.setAttribute('class', 'post-likes');
        likeButton.setAttribute('class', 'post-like-button');
        likeButton.setAttribute('role', 'button');
        likeButton.setAttribute('title', 'Like this post')
        likeButton.addEventListener('click', ()=>like_post(post.id, current_author));
        likeLength.setAttribute('class', 'post-likes-length');
        likeLength.setAttribute('title', 'View who has liked this post');
        likeLength.addEventListener('click', ()=>get_likes(post.id));
        likeLength.innerHTML = post.likes.length;

        // Add elements to created post and prepend created post to post list div
        author.appendChild(authorImg);
        author.appendChild(authorText);
        likes.appendChild(likeButton);
        likes.appendChild(likeLength);
        createdPost.appendChild(author);
        createdPost.appendChild(timestamp);
        createdPost.appendChild(content);
        createdPost.appendChild(editArea);
        createdPost.appendChild(editBtn);
        createdPost.appendChild(likes);
        document.querySelector('#post-list').prepend(createdPost);

        current_content.value = '';
        createdPost.style.animationPlayState = 'running';
        
    })
}

function clear_content(element) {
    if (textClick === false) {
        element.value = '';
        textClick = true;
    }
}

function edit_content(postId, userId){

    // Identify text area, button, and p elements for content
    const postDiv = document.getElementById(`post${postId}-div`);
    const editBox = postDiv.querySelector('.post-content-edit');
    const contentBox = postDiv.querySelector('.post-content');
    const editButton = postDiv.querySelector('.post-edit');

    if (!editContent) {

        // Hide content box, show text area and change button text to "Save"
        Object.assign(contentBox.style, {
            "margin": "0px",
            "height": "0px",
            "visibility": "hidden"
        })

        Object.assign(editBox.style, {
            "margin": "15px",
            "height": "fit-content",
            "visibility": "visible"
        })

        editButton.innerHTML = 'Save';
        editContent = true;
    
    } else {

        // Update database with new content
        fetch(`posts/${postId}`,{
            method: 'PUT',
            headers: {'X-CSRFToken': get_cookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                "user": userId,
                "content": editBox.value
             })
        })
        .then(response => response.json())
        .then(post => {
            // Set content box to user input
            contentBox.innerHTML = post.content;
            const editTime = postDiv.querySelector('.post-edit-time');
            
            // If post has not been edited before, create a span to display edited time
            if (!editTime) {
                console.log(editTime);
                // Identify post container and create edited span
                const editedSpan = document.createElement('span');

                // Set edited attributes
                editedSpan.classList.add('post-edit-time');
                editedSpan.value = `Edited on ${post.edited}`;
                
                // Insert edited timestamp
                postDiv.insertBefore(editedSpan, contentBox);

            // If post has been edited before, update the existing edited time
            } else {
                editTime.textContent = `Edited on ${post.edited}`;
            }

            // Hide text area and show content box
            Object.assign(contentBox.style, {
                "margin": "15px",
                "height": "fit-content",
                "visibility": "visible"
            })

            Object.assign(editBox.style, {
                "margin": "0px",
                "height": "0px",
                "visibility": "hidden"
            })
            const likeCount = postDiv.querySelector('.post-likes-length');
            if (post.likes){
                likeCount.value = post.likes.length;
            } else {
                likeCount.value = 0;
            }
            editButton.innerHTML = 'Edit';
            editContent = false;

        })
    }
}

function like_post(id, user){

    fetch(`/posts/${id}/like`, {
        method: 'PUT',
        headers: {'X-CSRFToken': get_cookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            "user": user
        })
    })
    .then(response => response.json())
    .then(post => {
        const postDiv = document.getElementById(`post${id}-div`);
        const likeCount = postDiv.querySelector('.post-likes-length');
        
        if (post.likes.length){
            likeCount.innerHTML = post.likes.length;
        } else {
            likeCount.innerHTML = 0;
        }
    })
}

function follow_user(profile, user){
    fetch(`/${profile}/follow`, {
        method: 'PUT',
        headers: {'X-CSRFToken': get_cookie('csrftoken')},
        mode: 'same-origin',
        body: JSON.stringify({
            "follower": user
        })
    })
    .then(response => response.json())
    .then(profile => {
        const followerDiv = document.getElementById(`followers-div`);
        const followers = followerDiv.querySelector('.follow-body');
        const followBtn = document.getElementById('follow-button');
        
        if (profile.followers.length){
            followers.innerHTML = profile.followers.length;
        } else {
            followers.innerHTML = 0;
        }

        if (followBtn.textContent === 'Follow'){
            followBtn.textContent = 'Unfollow';
        } else {
            followBtn.textContent = 'Follow';

        }
    })
}

function change_image(id){
    // If id is string, change to number
    if (typeof id === "string") {
        id = Number(id);
    }

    // Identify popup elements
    const popupDiv = document.getElementById('popup-div');
    const popupBody = document.getElementById('popup-body');
    const popupHeadText = document.getElementById('popup-head-text');

    // If function has already been run, make sure it's visible then end
    if (imgClick === true) {
        if (popupDiv.style.visibility === 'hidden') {
            popupDiv.style.visibility = 'visible';
        }
        return false;
    }
    // If non-follower elements populate the popup, remove them, and set other functions to false
    else if ( followersFunction || followingFunction || likeFunction ) {
        while(popupBody.lastChild) {
            popupBody.removeChild(popupBody.lastChild);
        }
        followersFunction = false;
        followingFunction = false;
        likeFunction = false;
    }
    // Shows dialog box and set header info
    popupDiv.style.visibility = 'visible';
    popupHeadText.innerHTML = 'Change Profile Image';

    // Create form elements
    const address = document.createElement('input');
    const label = document.createElement('label');
    const submit = document.createElement('button');

    address.setAttribute('type', 'url')
    address.setAttribute('name', 'img-address');
    address.setAttribute('id', 'img-address');
    address.setAttribute('placeholder', 'www.your-image.com');
    address.required = true;
    
    label.setAttribute('for', 'img-address')
    label.innerHTML = 'What is the web address for your profile image?'

    // Create submit button and assign onclick function
    submit.setAttribute('type', 'button');
    submit.setAttribute('id', 'change-img-btn');
    submit.innerHTML = 'Update';
    submit.onclick = function(){
        // API call to update profile image
        fetch(`/${id}/profile`,{
            method: 'PUT',
            headers: {'X-CSRFToken': get_cookie('csrftoken')},
            mode: 'same-origin',
            body: JSON.stringify({
                img: document.getElementById('img-address').value,
            })
        })
        .then( () => {
            // Set profile image on page, then reset form
            document.getElementById('profile-img').setAttribute('src', document.getElementById('img-address').value);
            document.getElementById('img-address').value = '';
        })
        .then( ()=> close_popup() );
    }

    // Append elements to popup
    popupBody.appendChild(label);
    popupBody.appendChild(address);
    popupBody.appendChild(submit);

    imgClick = true;
}

function get_followers(id){

    // Identify popup elements
    const popupDiv = document.getElementById('popup-div');
    const popupBody = document.getElementById('popup-body');
    const popupHeadText = document.getElementById('popup-head-text');

    // If function has already been run, make sure it's visible then end
    if (followersFunction === true) {
        if (popupDiv.style.visibility === 'hidden') {
            popupDiv.style.visibility = 'visible';
        }
        return false;
    }
    // If non-follower elements populate the popup, remove them and set other functions to false
    else if (followingFunction || likeFunction || imgClick ) {
        while(popupBody.lastChild) {
            popupBody.removeChild(popupBody.lastChild);
        }
        followingFunction = false;
        likeFunction = false;
        imgClick = false;
    }
    // Shows dialog box and set header info
    popupDiv.style.visibility = 'visible';
    popupHeadText.innerHTML = 'Followers';

    // Do not run function again unless box is closed
    followersFunction = true;
 
    generate_popup(id, "followers")    
}

function get_following(id){

    // Identify popup elements
    const popupDiv = document.getElementById('popup-div');
    const popupBody = document.getElementById('popup-body');
    const popupHeadText = document.getElementById('popup-head-text');

    // If function has already been run, make sure it's visible then end
    if (followingFunction === true) {
        if (popupDiv.style.visibility === 'hidden') {
            popupDiv.style.visibility = 'visible';
        }
        return false;
    }
    // If non-follower elements populate the popup, remove them and set other functions to false
    else if (followersFunction || likeFunction || imgClick ) {
        while(popupBody.lastChild) {
            popupBody.removeChild(popupBody.lastChild);
        }
        followersFunction = false;
        likeFunction = false;
        imgClick = false;
    }
    // Shows dialog box and set header info
    popupDiv.style.visibility = 'visible';
    popupHeadText.innerHTML = 'Following';

    // Do not run function again unless box is closed
    followingFunction = true;
 
    generate_popup(id, "following")    
}

function get_likes(id) {

    // Identify popup elements
    const popupDiv = document.getElementById('popup-div');
    const popupBody = document.getElementById('popup-body');
    const popupHeadText = document.getElementById('popup-head-text');

    // If function has already been run, make sure it's visible then end
    if (likeFunction === id) {
        if (popupDiv.style.visibility === 'hidden') {
            popupDiv.style.visibility = 'visible';
        }
        return false;
    }
    // If non-follower elements populate the popup, remove them and set other functions to false
    else if (followersFunction || followingFunction || imgClick || likeFunction != id ) {
        while(popupBody.lastChild) {
            popupBody.removeChild(popupBody.lastChild);
        }
        followersFunction = false;
        followingFunction = false;
        imgClick = false;
    }
    // Shows dialog box and set header info
    popupDiv.style.visibility = 'visible';
    popupHeadText.innerHTML = 'Users who liked this post';

    // Do not run function again unless box is closed
    likeFunction = id;
 
    generate_popup(id, "likes")

}

function generate_popup(id, relationship) {
    
    // Identify popup body in DOM
    const popupBody = document.getElementById('popup-body');

    // Get users from API
    fetch(`/${id}/${relationship}`)
    .then(response => response.json())
    .then(users => {
        
        for (const user of users) {

            // Create container with image and username for each user
            const userLink = document.createElement('a')
            const userDiv = document.createElement('div');
            const imageDiv = document.createElement('div');
            const userImage = document.createElement('img');
            const userName = document.createElement('span');

            // Clicking anywhere on the div will load user's profile
            userLink.setAttribute('href', `/${user.id}`);
            userLink.classList.add('user-container');
            userDiv.classList.add('user-div');

            // Set image attributes
            imageDiv.classList.add('user-img-div');
            userImage.setAttribute('src', `${user.image}`);
            userImage.setAttribute('id', `user${user.id}-img`);
            userImage.className = 'user-img';

            // Set name attributes
            const userUsername = user.username.replace(/ /g,"-");
            userName.setAttribute('id', `user-${userUsername}`);
            userName.className = 'user-username';
            userName.innerHTML = `${user.username}`;

            //Append to popup
            userDiv.appendChild(imageDiv);
            imageDiv.appendChild(userImage);
            userDiv.appendChild(userName);
            userLink.appendChild(userDiv);
            popupBody.appendChild(userLink);

        }
    })
}

function close_popup(){
    popupDiv = document.getElementById('popup-div');
    popupDiv.style.visibility = 'hidden';
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