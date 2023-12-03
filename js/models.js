"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "hostname.com";
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(currentUser, {title, author, url}) {
    // UNIMPLEMENTED: complete this function!
    const token = currentUser.loginToken
    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}/stories`,
      data: {token, story: {title, author, url} },
    });
    const story = new Story(response.data.story);
    this.stories.unshift(story);
    currentUser.ownStories.unshift(story);
    console.log("Made New")
    return story;

  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    try {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });
    } catch(err) {
      $('#error-msg').html(`*<small>${err.response.data.error.title}</small>`);
      $("#error-msg").show();
    }

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
 
  static async loginViaStoredCredentials(token, username) {
    // Included a try and catch for error messages during signup
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  async addFavorite(story) {
    this.favorites.push(story)
    await this.addOrRemoveFave('add', story)
  }

  async unFavorite(story) {
    console.log('deleted')
    this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId)
    await this.addOrRemoveFave('remove', story)
  }

  async addOrRemoveFave(state, story) {
    let method = state === 'add' ? 'POST' : 'DELETE';
    const token = this.loginToken;
    const response = await axios ({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: `${method}`,
      params: { token }
    })
  }

  checkOwnStory(story) {
    return this.ownStories.some((s) => (s.storyId === story.storyId));
  }

  checkFavor(story) {
    return this.favorites.some((s) => (s.storyId === story.storyId));
  }

  async delStory(story) {
    this.ownStories = this.ownStories.filter((s) => (s.storyId !== story.storyId))
    storyList.stories = storyList.stories.filter((s) => (s.storyId !== story.storyId))
    putOwnStoriesOnPage();
    await this.deleteStory(story)
  }

  async deleteStory(story) {
    const token = this.loginToken;
    const response = await axios ({
      url: `${BASE_URL}/stories/${story.storyId}`,
      method:  'DELETE',
      params: { token }
    })
    console.log(`${story.storyId} was deleted from API`)
  }

  // updates an owned story
  async updateStory(storyID, { title, author, url, }) {
    const token = this.loginToken;
    const response = await axios({
      method: 'PATCH',
      url: `${BASE_URL}/stories/${storyID}`,
      data: {token, story: {title, author, url} },
    });

    console.log(response.data);

    const storyUpdate = currentUser.ownStories.find((s) => s.storyId === storyID);
    console.log(storyUpdate)
    storyList.stories.unshift(storyUpdate);
    this.ownStories.unshift(storyUpdate);
    console.log("updated")
    return storyUpdate;
  }
}
