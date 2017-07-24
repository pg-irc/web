import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import auth from 'feathers-authentication-client';
import reduxifyServices, {  } from 'feathers-reduxify-services';

const superagent = require('superagent');
const rest = require('feathers-rest/client');
const { siteConfig } = window;

const url = (siteConfig && siteConfig.serverUrl) || 'http://backend.refugee.info/api';
const restClient = rest(url);

const client = feathers()
    .configure(restClient.fetch(window.fetch.bind(window)))
    .configure(hooks())
    .configure(auth())
    ;

const services = reduxifyServices(client, ['articles', 'countries', 'locations', 'categories']);

export default services;