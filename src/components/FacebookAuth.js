import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./FacebookAuth.css";

function App() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageInfo, setPageInfo] = useState({});
  const [pageInsights, setPageInsights] = useState({});
  const appId = "1018833189683895";
  const pageAccessToken = "EAAOen5ZAbQrcBOwb4Wgv03ZCzkfWZCcFLyM92pEFMtGN1dJalU99qmyFP4XOQlZCUZAZCFFHEaoKPo3ndvPjZCc3kMxsSBgmRsMrddEZBA7FZAWo5TIleWFUSfGUNjLyLzNwV4OKdfvVC7LmkFpaxn8707yg7psHlujWlKLE2ssIZBXYg5vVxCtAlkWQY3RgrqQJLGuMzQunOCmY08w3SDGgtG4VgJMOIZD";

  useEffect(() => {
    if (appId) {
      const loadFbSdk = () => {
        window.fbAsyncInit = function () {
          if (window.FB) {
            window.FB.init({
              appId: appId,
              cookie: true,
              xfbml: true,
              version: 'v20.0',
            });

            window.FB.AppEvents.logPageView();
          }
        };

        if (!document.getElementById('facebook-jssdk')) {
          const js = document.createElement('script');
          js.id = 'facebook-jssdk';
          js.src = 'https://connect.facebook.net/en_US/sdk.js';
          document.body.appendChild(js);
        }
      };

      loadFbSdk();
    }
  }, [appId]);

  const checkLoginState = () => {
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        window.FB.api('/me', { fields: 'name,picture' }, (userData) => {
          setUser(userData);
          fetchPages();
        });
      }
    });
  };

  const fetchPages = () => {
    window.FB.api('/me/accounts', (response) => {
      setPages(response.data);
    });
  };

  const handleLogin = () => {
    if (window.FB) {
      window.FB.login(checkLoginState, { scope: 'public_profile,pages_show_list' });
    } else {
      console.error('Facebook SDK not loaded yet.');
    }
  };

  const handlePageSelection = (event) => {
    const pageId = event.target.value;
    if (pageId) {
      setSelectedPage(pageId);
      fetchPageInfo(pageId);
      fetchPageInsights(pageId);
    } else {
      setSelectedPage(null);
      setPageInfo({});
      setPageInsights({});
    }
  };

  const fetchPageInfo = (pageId) => {
    if (!pageId) return;

    axios.get(`https://graph.facebook.com/${pageId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name,fan_count,followers_count'
      }
    })
    .then(response => {
      if (response.data) {
        setPageInfo(response.data);
      } else {
        console.error('No data returned from Facebook API:', response);
        setPageInfo({});
      }
    })
    .catch(error => {
      console.error('Error fetching page info:', error);
    });
  };

  const fetchPageInsights = (pageId) => {
    if (!pageId) return;

    const since = '2023-07-01';
    const until = '2024-07-31';
    const metrics = 'page_engaged_users,page_impressions';
    const period = 'day,week';

    axios.get(`https://graph.facebook.com/${pageId}/insights`, {
      params: {
        access_token: pageAccessToken,
        metric: metrics,
        since: since,
        until: until,
        period: period
      }
    })
    .then(response => {
      if (response.data && response.data.data) {
        const insights = {};
        response.data.data.forEach((item) => {
          insights[item.name] = item.values;
        });
        setPageInsights(insights);
        
      } else {
        console.error('No data returned from Facebook API:', response);
        setPageInsights({});
      }
    })
    .catch(error => {
      console.error('Error fetching page insights:', error);
    });
  };

  return (
    <div className="Home">
      <div className="page-insights">
        <h1>Facebook Page Insights</h1>
      </div>
      <div className="facebook-page">
        {!user && (
            <div className="login-button">
                <button className="login-btn" onClick={handleLogin}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25"        fill="white" class="bi bi-facebook" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                </svg>Login with Facebook</button>
        </div>
        )}
        {user && (
            <div className="user-info">
                <h2>Welcome, {user.name}</h2>
                <img className="profile-pic" src={user.picture.data.url} alt="Profile" />
                <div className="page-selection">
                    <h3>Select a Page</h3>
                    <select onChange={handlePageSelection}>
                    <option value="">Select a page</option>
                    {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                        {page.name}
                        </option>
                    ))}
                    </select>
                </div>
            
                {selectedPage && (
                    <div className="page-insight">
                        <h3>Page Insights</h3>
                        <div className="insight">
                            <p>Page ID: <span>{pageInfo.id}</span></p>
                            <p>Page Name: <span>{pageInfo.name}</span></p>
                            <p>Fans Likes: <span>{pageInfo.fan_count}</span></p>
                            <p>Total Followers: <span>{pageInfo.followers_count}</span></p>
                            <p>Total Engagement: <span>{pageInsights.page_engaged_users ? pageInsights.page_engaged_users[0].value : 'N/A'}</span></p>
                        </div>
                        <div className="insight">
                            <p>Total Impressions: <span>{pageInsights.page_impressions ? pageInsights.page_impressions[0].value : 'N/A'}</span></p>
                        </div>
                    </div>
                )}
            </div>
            )}
        </div>
    </div>
  );
}

export default App;