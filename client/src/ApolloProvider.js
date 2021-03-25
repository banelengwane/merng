import React from 'react';
import App from './App';

import { InMemoryCache, createHttpLink, ApolloProvider, ApolloClient } from '@apollo/client';

const httpLink = createHttpLink({
    uri: 'http://localhost:5000/'
});

const defaultOptions = {
    watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
    },
    mutate: {
        errorPolicy: 'all',
    },
};

const client = ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    // Provide some optional constructor fields
    name: 'react-web-client',
    version: '1.3',
    queryDeduplication: false
});

export default (
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
)