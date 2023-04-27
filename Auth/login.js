const authClient = solidClientAuthentication.default;

var url = new URL(window.location.href)
const url_hash = url.hash;

const callback = url.origin+url.pathname;

const IdP = url.searchParams.get('idp') || '';
const autoLogin = url.searchParams.get('autologin');
var sLogin = url.searchParams.get('slogin');

const authCode =
    url.searchParams.get("code") ||
    // FIXME: Temporarily handle both auth code and implicit flow.
    // Should be either removed or refactored.
    url.searchParams.get("access_token");


  if (sLogin === '1') {
    localStorage.setItem('slogin','1');
  } else {
    sLogin = localStorage.getItem('slogin');
    if (!authCode)
      sLogin=0;
  }




  document.addEventListener('DOMContentLoaded', async () => 
  {
    if (authCode) {
      var authData = {url: location.href}

      for(var i=0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('issuerConfig:') || key.startsWith('solidClientAuthenticationUser:') || key.startsWith('oidc.'))
           authData[key] = localStorage.getItem(key);
      }

      if (sLogin === '1')
        window.postMessage('oidc-code1:'+btoa(JSON.stringify(authData)), location.origin);
      else
        window.postMessage('oidc-code:'+btoa(JSON.stringify(authData)), location.origin);
      await sleep(3*1000);
    }

    initButtons((sLogin==='1'), IdP)


    if (window.location.hash === '#relogin') {
      await authClient.logout();
    }
/***
    // Check if user is already logged in
    const session = await authClient.currentSession()
    if (session && session.hasCredentials()) {
      if (sLogin === '1')
        window.postMessage('oidc-webid-slogin:', location.origin);
      else
        window.postMessage('oidc-webid:', location.origin);

      localStorage.removeItem('slogin');
      sLogin = null;
      show('logged')
      show('logout')
      setField("webid", session.idClaims.sub)
    }
***/
    if (sLogin === '1' || autoLogin === '1') {
      login(IdP);
    }
  })


  async function login (idp) 
  {
    try {
      authClient.login({
        oidcIssuer: idp,
        redirectUrl: callback,
        clientName: "OSDS"
      });

    } catch (error) {
      console.log('Error logging in:')
      console.error(error)
      console.log('Make sure this page is served via HTTPS, otherwise browser will block it')
    }
  }

  function logout () {
    console.log('Logging out...')
    authClient.logout()
    hide('logged')
    hide('logout')
  }

  /**
   * App/UI logic. This would normally done in React, Ember, Vue, etc.
   */
  function initButtons (slogin, idp) {
    initButton('login_community', () => login('https://solidcommunity.net'))
    initButton('login_inrupt', () => login('https://broker.pod.inrupt.com'))
    initButton('login_opl_oidc', () => login('https://solid.openlinksw.com:8444'))
    initButton('login_opl_v5', () => login('https://solid.openlinksw.com:8445'))
    initButton('login_opl_v5_6', () => login('https://solid.openlinksw.com:8443'))
    initButton('login_opl_comm', () => login('https://solid.openlinksw.com:8446'))
    initButton('login_opl_ds', () => login('https://ods-qa.openlinksw.com'))
    initButton('login_opl_uriburner', () => login('https://linkeddata.uriburner.com'))
    initButton('login_opl_myopl', () => login('https://my.openlinksw.com'))
    initButton('login_opl_id', () => login('https://id.myopenlink.net'))
    
    initButton('login-custom', () => {
      var idp = document.getElementById('custom-idp').value
      if (idp.endsWith("/"))
        idp = idp.substring(0, idp.length - 1)
      login(idp)
    })

    if (slogin || idp) {
        document.getElementById('custom-idp-form').classList.toggle('hidden')
        document.getElementById('login_community').classList.toggle('hidden')
        document.getElementById('login_inrupt').classList.toggle('hidden')
        document.getElementById('login_opl_oidc').classList.toggle('hidden')
        document.getElementById('login_opl_v5').classList.toggle('hidden')
        document.getElementById('login_opl_v5_6').classList.toggle('hidden')
        document.getElementById('login_opl_comm').classList.toggle('hidden')
        document.getElementById('login_opl_ds').classList.toggle('hidden')
        document.getElementById('login_opl_uriburner').classList.toggle('hidden')
        document.getElementById('login_opl_myopl').classList.toggle('hidden')
        document.getElementById('login_opl_id').classList.toggle('hidden')

        document.getElementById('enable-custom').classList.toggle('hidden')
        document.getElementById('cancel-custom').classList.toggle('hidden')
        
        document.getElementById('custom-idp').value = idp;
    } else {
      initButton('cancel-custom', () => {
        hide('custom-idp-form')
      })
      initButton('enable-custom', () => {
        var f = document.getElementById('custom-idp-form')
        f.classList.toggle('hidden')
      })
    }

    initButton('logout', () => logout())
  }

  
  function initButton(id, action) {
    document.getElementById(id).addEventListener('click', action)
  }


  /**
   * App-specific util functions, ignore.
   */
  function setField (id, value) {
    var field = document.getElementById(id)
    if (field) {
      field.innerHTML = value
    }
  }
  function setFieldText (id, value) {
    var field = document.getElementById(id)
    if (field) {
      field.innerText = value
    }
  }
  function hide (id) {
    document.getElementById(id).classList.add('hidden')
  }
  function show (id) {
    document.getElementById(id).classList.remove('hidden')
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

