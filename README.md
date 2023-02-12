# Multi-armed Bandit Example (Research Project)

This is a demonstration of how to use Reinforcement Learning to train [a multi-armed bandit](https://vwo.com/blog/multi-armed-bandit-algorithm/) in the browser. A multi-armed bandit can be used to perform automated A/B testing on a website or application, while gradually converging your users to the ideal user-experience, given a goal of your choosing.

In this demo, we're automatically generating various website layouts that we want our users to view. There are subtle changes made to the website every time you load the website again, including things like changes in button size, color, or position on the page. In the background, Federated learning will track which layouts the user does what we want (click a button) and report a positive model diff for that particular layout. For all other layouts where the user doesn't click on the button, we do not report anything. Over time, our model will slowly start to converge on a "preferred user experience" for the best layout, as chosen by user actions.

While this demo is inherently simple, it's easy to see how one could extend it to a real-world application whereby website layouts are generated and tested by real users, slowly converging to the preferred UX. We're particuarly excited to see derivations of this demo in real-world web and mobile development!

## Quick Start (Docker, DB and Backend)
1. Install dependencies
    ```
    cd client
    npm install
    ```
2. Set env
    ### 1.1 Set ENV

    Go to path server > fl_server
    - Rename .env.sample file to .env

    ### 1.2 Run Migrations
    - python manage.py makemigrations
    - python manage.py migrate

    ### 1.3 Seed ServerData Table
    - python manage.py loaddata core/fixtures/init-data.json
3. Run database and backend
    ``` 
    docker compose up
    ```
    This will start a backend server(Federated Learning Aggregation ) and a dashboard(Visual display of training).
## Start website and webextension
1. Start the website (in Firefox)
   ``` 
   cd website
   npm install
   npm run website
   ```
   This will start the website on which we apply/use RL(Reinforcement learning) and FL(Federated Learning).
## Install webextension
1. Install the webextension https://github.com/shashigharti/browser-extension-user-privacy


Author: Maddie Shang, Shashi Gharti
