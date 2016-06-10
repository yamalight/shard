
0.14.0 / 2016-06-10
==================

  * implement background push notifications
  * add basic notifications display widget
  * allow specifying basic notification settings
  * basic notifications creation on user messages
  * disallow negative unread counts
  * fix error that appeared while closing team edit dialogue
  * always put me-team on top of list

0.13.0 / 2016-06-09
==================

  * unread counts for team, channels and private conversations
  * remove unneeded local css class
  * rename docker db folder to evade names clash with db subfolder
  * use correct icons for conversations in command palette
  * add me team to command palette
  * match full usernames, not just start

0.12.0 / 2016-06-08
==================

  * implement user conversations
  * do not scale widgets for now at all
  * fix loading indication issue for empty channels
  * change tagline
  * fix fetching older history
  * correctly handle history cleaning

0.11.0 / 2016-06-06
==================

  * add changelog display in app
  * fix issue with status display during history fetching
  * fix push notifications

0.10.0 / 2016-06-03
==================

  * add updates stream and handle dynamic team and channel updates
  * use update socket for dynamic updates, remove polling
  * check rights for channel and team invites separately
  * reset auth error on login

0.9.0 / 2016-06-03
==================

  * display team description in join dialogue
  * allow editing team info and add team descriptions
  * do not render description in join channels when there is none
  * focus on chat input on channel switch
  * reload public channels on subsequent join dialogue opens
  * show loading indication when loading public teams and channels
  * rewrite subchannels
  * allow using double-click to start message edit

0.8.0 / 2016-06-02
==================

  * allow joining public teams and channels
  * allow using commandpalette to switch channels and teams
  * allow creating public/private teams and channels
  * correctly size message edit textarea, allow committing with enter

0.7.0 / 2016-05-31
==================

  * allow using arrow up for editing last message
  * allow editing messages and replies
  * show loader during team load
  * correctly handle replies to more messages
  * do not render chat parts if no channel is selected
  * extract styles into main.css for production

0.6.0 / 2016-05-30
==================

  * better message menu
  * allow editing and deleting channels
  * load hint.css after bulma to stop it from breaking lists

0.5.0 / 2016-05-27
==================

  * add /invite command
  * add /rename command to rename channels
  * allow editing description
  * add fourth column for infobar
  * split chat component into header, messages and input
  * correctly scroll to end on channel change
  * fix channel switching when coming from url
  * fix display for empty descriptions

0.4.0 / 2016-05-26
==================

  * allow using arrow keys to select typeahead result
  * limit typeahead size
  * basic slash commands support
  * show chat input only if channel is selected
  * add basic userbar component and logout button
  * channel names are now lowercase unique
  * correctly de-authorize on token expiration
  * variety of minor bugfixes

0.3.0 / 2016-05-25
==================

  * add desktop notifications about new unread messages
  * only mark unread if user is active
  * add autosizable multiline input
  * use momentjs for better timestamp formatting
  * allow loading previous messages from history
  * add babel-react-optimize for production

0.2.0 / 2016-05-24
==================

  * better production compilation
  * fix read message updates
  * display errors when available
  * reset channels on team switch and show loading indicator
  * better message, channel and team validation and sanity checks
  * disallow empty messages
  * focus chat input in various cases
  * better typeahead styling
  * correctly size content to hide scrollbars
  * allow using enter to submit various forms
  * general code refactoring
  * better logging
  * persist development db upon restarts

0.1.0 / 2016-05-20
==================
  * initial version with basic functionality
