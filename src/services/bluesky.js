import { BskyAgent } from '@atproto/api';

const agent = new BskyAgent({
  service: 'https://bsky.social'
});

export const loginWithBluesky = async (identifier, password) => {
  try {
    const formattedIdentifier = formatIdentifier(identifier);
    console.log('Attempting login with:', formattedIdentifier);
    
    const response = await agent.login({
      identifier: formattedIdentifier,
      password: password
    });

    console.log('Raw login response:', response);

    if (response && response.success !== false) {
      const session = {
        did: response.data.did,
        handle: response.data.handle,
        email: response.data.email,
        accessJwt: response.data.accessJwt,
        refreshJwt: response.data.refreshJwt
      };

      agent.session = session;

      return {
        success: true,
        data: session
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed';
    
    if (error.status === 401) {
      errorMessage = 'Invalid username or password';
    } else if (error.status === 429) {
      errorMessage = 'Too many attempts, please try again later';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

const formatIdentifier = (identifier) => {
  identifier = identifier.replace('@', '');
  if (!identifier.includes('.') && !identifier.includes('@')) {
    identifier = `${identifier}.bsky.social`;
  }
  return identifier;
};

export const getTimeline = async () => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.getTimeline();
    console.log('Timeline response:', response);

    return {
      success: true,
      data: response.data.feed
    };
  } catch (error) {
    console.error('Timeline error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createPost = async (text) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.post({
      text: text,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Post creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const searchUsers = async (term) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.searchActors({
      term,
      limit: 10
    });

    return {
      success: true,
      data: response.data.actors
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getProfile = async (actor) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.getProfile({ actor });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const followUser = async (did) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.follow(did);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Follow error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export the agent instance if needed elsewhere
export const getAgent = () => agent;
