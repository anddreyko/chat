var express = require('express')
  , mongoose = require('../lib/#mongoose')
  , mongoStore = require('connect-mongostore')(express)
  , sessionStore = new mongoStore({'db': 'session'});

module.exports = sessionStore;