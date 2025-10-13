### `npm run start:local`

Runs the app in development mode using environment variables from `local.env`.
This is useful for local testing with different credentials or settings.

You must have the `env-cmd` package installed (already included in dependencies).

Example `local.env`:

```
REACT_APP_B2C_CLIENT_ID=your-local-client-id-here
```

## Auth0 Configuration

If you ever change your Auth0 tenant, client ID, or API audience, update the following environment variables in your `.env` or `local.env` file:

```
REACT_APP_AUTH0_DOMAIN=your-tenant-region.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=your-api-audience
REACT_APP_API_URL=http://your-api-url
```

**Allowed Callback URLs in Auth0 Dashboard:**
- Make sure your application's callback URLs (e.g. `http://localhost:3000`) are listed in the Auth0 dashboard under your application's settings.

**Where to update:**
- These variables are used in your React app for authentication and API calls.
- If you change any Auth0 settings, update these values and restart your development server.

**Typical places to update:**
- `.env` or `local.env` in your project root
- Auth0 Dashboard → Applications → [Your App] → Settings

**Example:**
```
REACT_APP_AUTH0_DOMAIN=dev-uzwwd4s0ket1jp5g.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=bK2x5SXyRvvWOfvmpTAkOS2jdp9jaq11
REACT_APP_AUTH0_AUDIENCE=https://api.reach4.dev
REACT_APP_API_URL=http://127.0.0.1:8000
```

**Restart your app after making changes to environment variables.**

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
