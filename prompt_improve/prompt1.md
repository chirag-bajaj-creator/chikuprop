# Description: 
Currently there is a problem of the race condition when I added a feature that the person should not access the page by typing in the / followed by typing the route of the page
# Problems Faced
There is a race condition in my feature: when users click the feature from the website, it sometimes incorrectly shows a 404 page during navigation. This should not happen on normal clicks and needs to be fixed.
The 404 page should only appear when a user manually types the route in the browser/search bar and tries to access an invalid or unauthorized page directly.

# how modern websites handle 
And one more analysis you should do how the modern web application like.com both.com apple .com how they handle the race condition and how they handle the race condition for the specific problem I'm having