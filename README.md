cinnamon-gmail-notifier
=======================

A Gmail notifier applet for Cinnamon


Install
-------

1. Clone the repo.
2. Copy the gmailnotifier@denisigo directory to ~/.local/share/cinnamon/applets
3. Enable the Gmail Notifier applet in Cinnamon's applet settings.
4. Rejoice.


Settings
--------

Settings, including usernames and passwords are stored in settings.js, in plaintext. Make sure this file has sensible (400) permissions on it.

Multiple accounts can be used, as shown in the comments of the settings.js file.


Changelog
---------

v0.1a (i.e. changes from denisigo's v0.1)
* Added multiple Gmail account support
* Relevant account displayed in notification title
* Checking whether messages have been notified before is now done via the 'modified' date on the most recent message
* Unread and read icons are now the right way round ;)


Credits
-------

This applet was written by denisigo (http://cinnamon-spices.linuxmint.com/users/view/422), and buggered about with by Andrew Bell.
