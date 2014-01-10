#!/bin/env node

var phantom = require('phantom');
var requests = require('./request_queue')
var logger = console.log;
var jQuery = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";
var Table = require('cli-table');
var prompt = require('prompt');
prompt.colors = false;

console.log = function(){};

prompt.start();

var USERNAME;
var PASSWORD;

var goToLoginPage = function(ph, page) {
  //logger("Hit login page")
  var loginPageUrl = "https://retail.ncbelink.com/corp/BANKAWAY?Action.RetUser.Init.001=Y&AppSignonBankId=077&AppType=corporate&CorporateSignonLangId=001";
  page.open(loginPageUrl);
};

var redirectToPasswordPage = function(ph, page) {
  //logger("Fill Out User ID")
  page.evaluate(function(username) {
    jQuery("input[name='DCCUserId']").val(username);
    login_WithoutEncrypt();
  }, null, USERNAME);
};

var passwordPage = function(ph, page) {
  //logger("Fill Out Password")
  page.includeJs(jQuery, function() {
    page.evaluate(function(password) {
      $("a#open").click();
      $("input[name='CorporateSignonPassword']").val(password);
      login();
    }, function() {
    }, PASSWORD );
  });
}

var accountsPage = function(ph, page) {
  page.includeJs(jQuery, function() {
    page.evaluate(function(password) {
      var accounts = $(".acc-content")[0];
      var trs = $(accounts).find("table tr");
      var rows = [];
      trs.each(function(index, tr){
        if(index >= 3) {
          t = [];
          $(tr).find("td").each(function(index, td) {
           t.push($(td).text().replace(/(\r\n|\n|\r)/gm," ").replace(/\s+/g," "));
          });
          rows.push(t);
        }
      }); 
      return rows;
    }, function(result) {
      var table = new Table();
      result.forEach(function(r){
        table.push(r);
      });
      logger(table.toString());
      ph.exit();
    });
  });
}


prompt.get([{
              name: 'username',
              required: true
            }, 
            {
              name: 'password',
              hidden: true,
            }
          ], 
function(err, result) {
  USERNAME = result.username;
  PASSWORD = result.password;
  
  phantom.create(function(ph) {
    ph.createPage(function(page) {
      var ncbHandler = requests(ph, page);
      ncbHandler.queue = [
        goToLoginPage,
        redirectToPasswordPage,
        passwordPage,
        accountsPage
      ];

      ncbHandler.start();
    });  
  });
});

