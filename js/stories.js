"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showTrash = false, showEdit = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
    <li id="${story.storyId}">
    <div class='story-list-content'>
      ${showTrash ? trashicon() : ""}
      ${starButton(story, currentUser)}
      <span class='content-container'>
      <span class='story-header'>
        <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        ${showEdit ? editicon() : ""}
      </span>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
      </span>
    </div>
    </li>
    <hr>
  `);
}

function starButton(story, user) {
  const isFavorite = user.checkFavor(story);
  const faveType = isFavorite ? "fas" : "far";
  return `<span class='star'>
    <i class='${faveType} fa-star'></i>
  </span>`;
}

function trashicon() {
  return `<span class='trash'>
  <i class='fas fa-trash'></i>
</span>`;
}

function editicon() {
  return `<span class='edit'>
  <i class='fas fa-pencil-alt'></i>
</span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $("#fave-stories-list").hide();
  $("own-story-list").hide();
  $allStoriesList.show();
}

function putFaveStoriesOnPage() {
  console.debug("putFaveStoriesOnPage");

  $("#fave-stories-list").empty();

  if (currentUser.favorites.length == 0) {
    $("#fave-stories-list").append(
      "<strong>Currently Have No Favorites</strong>"
    );
  }
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $("#fave-stories-list").append($story);
  }

  $allStoriesList.hide();
  $("#own-stories-list").hide();
  $("#fave-stories-list").show();
}

function putOwnStoriesOnPage() {
  console.debug("putOwnStoriesOnPage");

  $("#own-stories-list").empty();

  if (currentUser.ownStories.length === 0) {
    $("#own-stories-list").append(
      "<strong>Currently Have No Owned Stories</strong>"
    );
  }
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story, true, true);
    $("#own-stories-list").append($story);
  }

  $allStoriesList.hide();
  $("#fave-stories-list").hide();
  $("#own-stories-list").show();
}

// ** Submits a new story **//
async function submitNewStory(e) {
  console.debug("submitNewStory");
  e.preventDefault();

  const title = $(".title-input").val();
  const author = $(".author-input").val();
  const url = $(".url-input").val();
  const username = currentUser.username;

  const story = await storyList.addStory(currentUser, {
    title,
    author,
    url,
    username,
  });

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  $("#story-form").trigger("reset");
  $("#story-form").hide();
  putStoriesOnPage();
}

$("#story-form").on("submit", submitNewStory);

async function updateStory(e) {
  console.debug("updateStory");
  e.preventDefault();
  const Id = JSON.parse(localStorage.getItem('IDofEditStory'))
  const storyId = Id.StoryID;

  const title = $(".title-input").val();
  const author = $(".author-input").val();
  const url = $(".url-input").val();
  const username = currentUser.username;

  await currentUser.updateStory(storyId, { title, author, url });

  location.reload();
  $("#story-form").trigger("reset");
  $("#story-form").hide();
  putStoriesOnPage();
}

$("#story-form").on("click","#update-story-form", updateStory);

async function deleteAStory(e) {
  console.debug("deleteAStory");
  const target = $(e.target);
  const storySel = target.closest("li");
  const storyId = storySel.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  await currentUser.delStory(story);
}

$(".stories-list").on("click", ".trash", deleteAStory);

async function favoriteToggle(e) {
  console.log("clicked!");
  console.debug("favoriteToggle");

  const target = $(e.target);
  const storySel = target.closest("li");
  const storyId = storySel.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if (target.hasClass("fas")) {
    await currentUser.unFavorite(story);
    target.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    target.closest("i").toggleClass("fas far");
  }
}

$(".stories-list").on("click", ".star", favoriteToggle);

