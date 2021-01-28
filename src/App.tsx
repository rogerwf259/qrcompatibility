import React, { ReactElement } from "react";
import { Router, Route, Switch } from "react-router-dom";
import QrReader from "./QrReader";
import { createBrowserHistory } from "history";
import Ticket from "./Ticket";

const history = createBrowserHistory();
export default function App(): ReactElement {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/">
          <QrReader />
        </Route>
        <Route path="/ticket">
          <Ticket />
        </Route>
      </Switch>
    </Router>
  );
}
