# Thompson Sampling with Federated Learning to capture user preference (Research Project)

This is a demonstration of how to use Reinforcement Learning to train [a multi-armed bandit](https://vwo.com/blog/multi-armed-bandit-algorithm/) in the browser. A multi-armed bandit can be used to perform automated A/B testing on a website or application, while gradually converging your users to the ideal user-experience, given a goal of your choosing.

In this demo, we're automatically generating various website layouts that we want our users to view. There are subtle changes made to the website every time you load the website again, including things like changes in button size, color, or position on the page. In the background, Federated learning will track which layouts the user does what we want (click a button) and report a positive model diff for that particular layout. For all other layouts where the user doesn't click on the button, we do not report anything. Over time, our model will slowly start to converge on a "preferred user experience" for the best layout, as chosen by user actions.

While this demo is inherently simple, it's easy to see how one could extend it to a real-world application whereby website layouts are generated and tested by real users, slowly converging to the preferred UX. We're particuarly excited to see derivations of this demo in real-world web and mobile development!

## Quick Start (Using docker)
1. Install dependencies
    ```shell
    cd client
    npm install
    ```
2. Set env
    ### 1.1 Set ENV

    Go to folder server > fl_server
    - Copy .env.sample file to .env

    Go to folder client
    - Copy .env.sample file to .env

    Env samples for different usecases are in ```envs``` folder.
    
3. Start database, client and server
    ```shell
    docker compose up
    ```
    This will start a backend server(Federated Learning Aggregation ) and a dashboard(Visual display of training). You can test by opening the admin and client as follows:
    - admin:  http://0.0.0.0:8082/admin
    - client: http://0.0.0.0:8083/

4. Run migration and seeder
    ### 4.1 Migrations
    
    ```shell
    docker exec -it <container_id> python manage.py makemigrations
    docker exec -it <container_id>  python manage.py migrate
    ```
    ### 4.2 Seed ServerData Table
    ```shell
    python manage.py loaddata core/fixtures/init-data.json
    ```

## Install webextension
1. Install the webextension https://github.com/shashigharti/browser-extension-user-privacy


## Start website and webextension
1. Start the website (in Firefox)
   ``` 
   cd website
   npm install
   npm run start
   ```
   This will start the website on which we apply/use RL(Reinforcement learning) and FL(Federated Learning).


Author: Maddie Shang, Shashi Gharti
