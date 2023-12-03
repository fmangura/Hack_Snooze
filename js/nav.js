"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */
function navSubmit(evt) {
  console.debug("navSubmit", evt);
  $('#story-form').show();
  $('#story-form-button').show();
  $('#update-story-form').hide();

}

$('#submit-link').on('click', navSubmit);

function updateSubmit(evt) {
  console.debug("updateSubmit", evt);
  console.log('clicked pencil')
  const target = $(evt.target);
  console.log(target)
  const storySel = target.closest("li");
  const storyId = storySel.attr("id");
  const storyObj = { StoryID: `${storyId}` }

  const story = storyList.stories.find((s) => s.storyId === storyId)
  console.log(story);

  $(".title-input").attr('placeholder', `${story.title}`);
  $(".author-input").attr('placeholder', `${story.author}`);
  $(".url-input").attr('placeholder', `${story.url}`);

  localStorage.setItem('IDofEditStory', JSON.stringify(storyObj))
  $('#story-form-button').hide();
  $('#update-story-form').show();
  $('#story-form').show();
}

$('.stories-list').on("click", ".edit", updateSubmit);

/** Show main list of all stories when click site name */
// Shows login form when clicked but not logged in
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  console.log(localStorage.getItem('token'));
  if (localStorage.getItem('token')){
  hidePageComponents();
  putStoriesOnPage();
  $('#story-form').hide();
  $('#own-stories-list').hide();
  $('#fave-form').hide();
  } else {
    $loginForm.show();
    $signupForm.show();
  }

}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
  $('#own-stories-list').hide();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navFaveStories(evt) {
  console.debug("navFaveStories", evt);
  hidePageComponents();
  putFaveStoriesOnPage();
  $('#story-form').hide();
  $('own-story-list').hide();
}

$("#favorite-link").on("click", navFaveStories)

function navOwnStories(evt) {
  console.debug("navOwnStories", evt);
  hidePageComponents();
  putOwnStoriesOnPage();
  $('#story-form').hide();
  $('#fave-form').hide();
}

$("#own-link").on("click", navOwnStories)