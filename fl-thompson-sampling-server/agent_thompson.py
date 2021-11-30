from scipy.stats import bernoulli
import numpy as np


class EnvModel:
    def __init__(self, slots=[0.1, 0.6, 0.8]):
        self.slots = slots
        self.action_space = list(range(len(slots)))

    def pull(self, slot_idx):
        # note this function returns both state and reward
        # reward = value of bernoulli rand var
        # state: (keep it simple) if reward is 1 then state is "win", else "not win"
        """@student: a  bernoulli random variable according to the slot expected rate of win"""

        return bernoulli.rvs(self.slots[slot_idx])


class AgentThompson:  # thompson sampling version of the agent
    def __init__(self, env):
        self.env = env
        self.action_space = env.action_space
        # initialize with "uninformative" beta prior, because we assume no prior knowledge of the environment
        # the ratio of the first/2nd param affects the shape of the beta distribution, you will see how in the visualizations later

        self.so_far = [(1, 1)] * len(self.action_space)
        self.time_step = 0
        self.total_score = 0

    def act(self):
        samples_from_beta_distr = {}
        for k in self.action_space:
            samples_from_beta_distr[k] = np.random.beta(
                self.so_far[k][0], self.so_far[k][1]
            )

        # print('samples_from_beta_distr', samples_from_beta_distr)
        selected_action = max(samples_from_beta_distr, key=samples_from_beta_distr.get)
        reward = self.env.pull(selected_action)
        self.time_step += 1
        self.total_score += reward
        return (selected_action, reward)

    def evaluate_n_update(self, prev_action, reward):
        # update using beta bernoulli conjugacy: it's just a mathematical convinience / efficient / beautiful that both functions have the same analytical form, we don't "need it"
        # see: https://en.wikipedia.org/wiki/Conjugate_prior for more info
        n = self.time_step
        prev_a, prev_b = self.so_far[prev_action]
        self.so_far[prev_action] = (prev_a + reward, prev_b + 1 - reward)
