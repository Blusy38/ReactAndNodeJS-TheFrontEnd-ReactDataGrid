import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import Users from '../src/users';

ReactDOM.render(
    <BrowserRouter>
        <Route path='/' component={Users} />
    </BrowserRouter>
  ,
  document.getElementById('root')
);