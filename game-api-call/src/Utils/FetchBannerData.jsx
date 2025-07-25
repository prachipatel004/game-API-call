
import axios from 'axios';
import useBannerStore from '../Store/BannerStore';

const BANNER_API_URL = 'http://sportapi.tracewavetransparency.com/api/v1/admin/common/banner_listing';

export const fetchBannerData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token not found in localStorage. API call skipped.');
      return;
    }

    const payload = {
      page: '1',
      per_page: '100', 
    };

    const response = await axios.post(BANNER_API_URL, payload, {
      headers: {
        'api-key': 'game@tracewave',
        platform: 'AnDroId@Trace',
        'is-encript': 'false',
        token: token,
      },
    });

    const resultData = response.data?.data?.result || [];

       console.log('////',resultData);

    useBannerStore.getState().setBanners(resultData);
    localStorage.setItem('bannerData', JSON.stringify(resultData));

    console.log('Fetched and stored banners:', resultData);
  } catch (err) {
    console.error('Banner fetch failed:', err);
  }
};
