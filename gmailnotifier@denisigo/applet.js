imports.searchPath.push( imports.ui.appletManager.appletMeta["gmailnotifier@denisigo"].path );

const Mainloop = imports.mainloop;
const Lang = imports.lang;
const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;

const Applet = imports.ui.applet;
const Util = imports.misc.util;

const GmailFeeder=imports.gmailfeeder;
const Settings=imports.settings;

function MyApplet(orientation) {
  this._init(orientation);
}

MyApplet.prototype = {
  __proto__: Applet.IconApplet.prototype,

  _init: function(orientation) {
    this._chkMailTimerId = 0;
    this.last_modified = new Array;
    this.litup = false;
    this.a_params = null;
    this.new_mail_flag = false;
    
    this.checkTimeout=Settings.checktimeout*1000;

    this.gf = new Array();

    Applet.IconApplet.prototype._init.call(this, orientation);
    
    var this_=this;

    try {
      this.set_applet_icon_symbolic_name('mail-read-symbolic');
      this.set_applet_tooltip(_("Click to display mail."));
      
      for(i = 0; i < Settings.username.length; i++)
      {
    	      this.last_modified[i] = '';
	      this.gf[i]=new GmailFeeder.GmailFeeder({
                'id':i,
		'username':Settings.username[i],
		'password':Settings.password[i],
		'callbacks':{
		  'onError':function(a_code,a_params){this_.onGfError(a_code,a_params)},
		  'onNewMail':function(a_params){this_.onGfNewMail(a_params)},
		  'onNoNewMail':function(a_params){this_.onGfNoNewMail()}
		}
	      });
      }

      this.updateChkMailTimer(5000);
    }
    catch (e) {
      global.logError(e);
    }
  },
  
  onGfError: function(a_code,a_params) {
    if(Settings.showerrors=='yes'){
      switch (a_code){
        case 'authFailed':
          this.showNotify("GmailNotifier",_("Gmail authentication failed!"));
        this.set_applet_tooltip(_("Gmail authentication failed!"));
        break;
        case 'feedReadFailed':
          this.showNotify("GmailNotifier",_("Gmail feed reading failed!"));
          this.set_applet_tooltip(_("Gmail feed reading failed!"));
        break;
        case 'feedParseFailed':
          this.showNotify("GmailNotifier",_("Gmail feed parsing failed!"));
          this.set_applet_tooltip(_("Gmail feed parsing failed!"));
        break;
      }
    }
  },
  
  onGfNoNewMail: function() {
    //this.set_applet_icon_symbolic_name('mail-unread-symbolic');
    //this.set_applet_tooltip(_('No new mails.'));
    this.new_mail_flag = false;
  },
  
  onGfNewMail: function(a_params) {
    this.new_mail_flag = true;
    this.a_params = a_params;
    if (a_params.count==1)
      this.set_applet_tooltip(_('You have one new mail. Click to display.'));
    else
      this.set_applet_tooltip(_('You have '+a_params.count+' new mails. Click to display.'));
    
    this.set_applet_icon_symbolic_name('mail-unread-symbolic');
    this.litup = true;
  
    if (this.last_modified[a_params.id] != a_params.messages[0].modified){
      var notifyTitle=_('You have one new mail ('+a_params.account+').');
      if (a_params.count > 1)
        notifyTitle=_('You have '+a_params.count+' new mails ('+a_params.account+').');
      var notifyText='';
      
      var mailsToDisplay=a_params.count;
      if (mailsToDisplay>4)
        mailsToDisplay=4;
      
      for (var i=0; i<mailsToDisplay; i++){
      
        var authorName=a_params.messages[i].authorName;
        var title=a_params.messages[i].title;
      
        notifyText+='<b>'+authorName+'</b>: '+title+'\r\n';
      }
      this.showNotify(notifyTitle,notifyText);

      if(this.temp_last_modified != null){
          this.last_modified = this.temp_last_modified;
          this.temp_last_modified = null;
      }

      this.last_modified[a_params.id] = a_params.messages[0].modified; 
    }
    
  },
  
  showNotify: function(a_title,a_message){
    a_title=a_title.replace(/"/g, "&quot;");
    a_message=a_message.replace(/"/g, "&quot;");
    
    Util.spawnCommandLine("notify-send --icon=mail-unread \""+a_title+"\" \""+a_message+"\"");
  },

  on_applet_clicked: function(event) {
    if(this.new_mail_flag == true){
      this.temp_last_modified = new Array;
      this.temp_last_modified = this.last_modified;
      this.last_modified = new Array;
      this.onGfNewMail(this.a_params);
    }
    else{
      var notifyTitle =_('You have no new mail');
      this.showNotify(notifyTitle, '');
    }
  },
  
  updateChkMailTimer: function(timeout) {

    if (this._chkMailTimerId) {
        Mainloop.source_remove(this._chkMailTimerId);
        this._chkMailTimerId = 0;
    }
    if (timeout > 0)
        this._chkMailTimerId = Mainloop.timeout_add(timeout,Lang.bind(this, this.onChkMailTimer));
  },

  onChkMailTimer: function() {

    this.litup = false;
    for(i = 0; i < this.gf.length; i++)
    {
	  this.gf[i].check();
    }
    this.updateChkMailTimer(this.checkTimeout);
    if(!this.litup) {
        this.set_applet_icon_symbolic_name('mail-read-symbolic');
        this.set_applet_tooltip(_('No new mails.'));
    }

  }
};

function main(metadata, orientation) {
  let myApplet = new MyApplet(orientation);
  return myApplet;
}
