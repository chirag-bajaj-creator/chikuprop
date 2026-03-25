[plugin:vite:oxc] Transform failed with 1 error:

[PARSE_ERROR] Error: Unexpected token
     ╭─[ src/components/common/Navbar.jsx:118:14 ]
     │
 118 │             {!isAdmin && (
     │              ┬  
     │              ╰── 
─────╯
C:/Users/CHIRAG BAJAJ/OneDrive/AppData/Desktop/real_website/client/src/components/common/Navbar.jsx
    at transformWithOxc (file:///C:/Users/CHIRAG%20BAJAJ/OneDrive/AppData/Desktop/real_website/client/node_modules/vite/dist/node/chunks/node.js:3720:19)
    at TransformPluginContext.transform (file:///C:/Users/CHIRAG%20BAJAJ/OneDrive/AppData/Desktop/real_website/client/node_modules/vite/dist/node/chunks/node.js:3788:26)
    at EnvironmentPluginContainer.transform (file:///C:/Users/CHIRAG%20BAJAJ/OneDrive/AppData/Desktop/real_website/client/node_modules/vite/dist/node/chunks/node.js:30023:51)
    at async loadAndTransform (file:///C:/Users/CHIRAG%20BAJAJ/OneDrive/AppData/Desktop/real_website/client/node_modules/vite/dist/node/chunks/node.js:24152:26)
    at async viteTransformMiddleware (file:///C:/Users/CHIRAG%20BAJAJ/OneDrive/AppData/Desktop/real_website/client/node_modules/vite/dist/node/chunks/node.js:24961:20)
Click outside, press Esc key, or fix the code to dismiss.
You can also disable this overlay by setting server.hmr.overlay to false in vite.config.js.