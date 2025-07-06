import { getPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { renderUserPostsPageComponent } from "./components/renderUserPostsPageComponent.js";


export let user = getUserFromLocalStorage();
// export let getposts = (newposts) => {
//   posts = newposts
// }
export let page = null;
export let posts = [];

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      // @@TODO: реализовать получение постов юзера из API
      console.log("Открываю страницу пользователя: ", data.userId);
      page = LOADING_PAGE;

      posts = [];
      // posts = [];
      function getposts() {
        return fetch(
          `https://wedev-api.sky.pro/api/v1/prod/instapro/user-posts/${data.userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        )
          .then((response) => {
            if (response.status === 401) {
              throw new Error("Нет авторизации");
            }
            if (response.status === 500) {
              throw new Error("ошибка сервера");
            }

            return response.json();
          })
          .then((data) => {
            return data.posts;
          })
          .then((newPosts) => {
            page = USER_POSTS_PAGE;
            posts = newPosts;
            renderApp();
          })
          .catch((error) => {
            console.error(error);
            goToPage(POSTS_PAGE);
          });
      }
      getposts({ token: getToken() });

      return renderApp();
    }
    page = newPage;
    // page = USER_POSTS_PAGE;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        // @TODO: реализовать добавление поста в API
        fetch("https://wedev-api.sky.pro/api/v1/prod/instapro", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            description,
            imageUrl,
          }),
        }).then((response) => {
          return response.json();
        });

        console.log("Добавляю пост...", { description, imageUrl });
        goToPage(POSTS_PAGE);
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    // @TODO: реализовать страницу с фотографиями отдельного пользвателя

    return renderUserPostsPageComponent({
      appEl,
    });
  }
};

goToPage(POSTS_PAGE);

