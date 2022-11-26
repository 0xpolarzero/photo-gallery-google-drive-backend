import { AboutDrawer } from '../components/admin/AboutDrawer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPen } from '@fortawesome/free-solid-svg-icons';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

export default function About() {
  const [about, setAbout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aboutDrawerOpen, setAboutDrawerOpen] = useState(false);
  const { user } = useUser();

  const getAboutFromSpreadsheet = async () => {
    const res = await fetch('/api/read-spreadsheet/read-about');
    const data = await res.json();

    if (data && data.length) {
      const formattedData = data[0].split('\n');
      setAbout(formattedData);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAboutFromSpreadsheet();
  }, []);

  return (
    <div className='about'>
      <div className='header'>
        <h2 style={{ margin: 0 }}>About me</h2>
        {user ? (
          <button
            className='action-btn item-with-icon'
            onClick={() => setAboutDrawerOpen(true)}
          >
            <FontAwesomeIcon icon={faPen} /> Edit
          </button>
        ) : null}
      </div>
      {loading ? (
        <Skeleton active title={false} paragraph={{ rows: 4 }} />
      ) : (
        about.map((item, index) => {
          return (
            <span key={index}>
              {item}
              <br />
            </span>
          );
        })
      )}
      <h2 style={{ marginTop: '2rem' }}>Contact</h2>
      <div className='social-links'>
        <FontAwesomeIcon
          icon={faTwitter}
          height={30}
          style={{ color: '#1da1f2' }}
        />
        <a
          className='twitter'
          href='https://twitter.com/0xpolarzero'
          target='_blank'
        >
          <span>@ 0xpolarzero</span>
        </a>

        <FontAwesomeIcon
          icon={faGithub}
          height={30}
          style={{ color: 'var(--color-secondary)' }}
        />
        <a className='github' href='https://github.com/polar0' target='_blank'>
          <span>@ polar0</span>
        </a>

        <FontAwesomeIcon
          icon={faEnvelope}
          height={30}
          style={{ color: '#d44638' }}
        />
        <a className='email' href='mailto:0xpolarzero@gmail.com'>
          <span>0xpolarzero@gmail.com</span>
        </a>
      </div>
      <AboutDrawer
        open={aboutDrawerOpen}
        setOpen={setAboutDrawerOpen}
        content={about}
        updateAbout={getAboutFromSpreadsheet}
      />
    </div>
  );
}
