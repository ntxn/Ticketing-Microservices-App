import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined')
    // we're on the server. Requests should be made to ingress-nginx service
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  else return axios.create({ baseURL: '/' });
};
