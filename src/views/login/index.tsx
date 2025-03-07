import {RouteComponentProps, useNavigate} from '@reach/router';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import {useTheme} from '@mui/material/styles';
import {Helmet} from 'react-helmet';

import Login from 'views/components/login';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import Github from 'svg/github';


const LoginPage = (_: RouteComponentProps) => {
    const theme = useTheme();
    const {isSm} = useMediaBreakPoint();
    const [t,] = useTranslation();
    const navigate = useNavigate();

    const onDone = () => navigate('/').then();

    return <>
        <Helmet><title>{t('NostrChat - Sign in')}</title></Helmet>
        <Box sx={{
            width: isSm ? '590px' : '96%'
        }}>
            <Card sx={{
                p: '26px 32px 46px 32px',
            }}>
                <Login onDone={onDone}/>
            </Card>
        </Box>
    </>;
}

export default LoginPage;
