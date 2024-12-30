The coding exercise is to create a "Custom Onboarding Flow" for users. Admins of the app (perhaps non-technical) would like to be able to customize the user onboarding flow. Several fields that are to be collected are known. But the team would like to be able to easily change the page that these fields appear on, perhaps for A/B testing, etc. The app should be broken down into three sections, outlined below. 

Section 1 - User Onboarding Section

This should be the main page of your app. It should have fields for email and password, and allow them to be submitted and persisted to the backend database. The onboarding flow should be structured similar to a "wizard"--such that the user is aware of where they are at in the overall onboarding flow. There should be three pages in the flow. The 2nd and 3rd pages are customizable via the admin section (see below). The three possible data "components" that can be added are:
* A large text area for an "About Me" section for the user
* An address collection set of form fields–one of each for: street address, city, state, and zip
* A birthdate selection UI element

Section 2 - Admin Section

This is an admin UI to manage which data "components" appear on which page. Each of the 2nd and 3rd pages should always have at least one component on them, possibly two. Admins should be able to modify which page each component appears on. So they might select Birthdate and About Me for the 2nd page, then just address on the 3rd. For the initial configuration upon submission, each page should default to having at least one "component" on them. It does not matter which ones are set as the default. This section should be accessible via the "/admin" URL path of your app.

Section 3 - Data Table

This is simply an HTML table displaying the user data that is in the database. As the user navigates through the flow, if this page is refreshed, it should show the new user data that has been entered. It should not require authentication to access. It is purely for testing so we can see how the app is interacting with the backend database. This section should be accessible via the "/data" URL path of your app.
