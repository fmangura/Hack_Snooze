"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */
function navSubmit(evt) {
  console.debug("navSubmit", evt);
  $('#story-form').show();
}

$('#submit-link').on('click', navSubmit);

function updateSubmit(evt) {
  console.debug("updateSubmit", evt);
  console.log('clicked pencil')
  $('#story-form').attr("id", "update-story-form");
  $('#update-story-form').show();
}

$('.stories-list').on("click", ".edit", updateSubmit);

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  $('#story-form').hide();
  $('#own-stories-list').hide();
  $('#fave-form').hide();
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