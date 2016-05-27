
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
