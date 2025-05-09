import {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import {RouteComponentProps, useLocation, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import isEqual from 'lodash.isequal';
import {nip19} from 'nostr-tools';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import AppMenu from 'views/components/app-menu';
import ChatInput from 'views/components/chat-input';
import ChatView from 'views/components/chat-view';
import ProfileCard from 'views/components/profile-card';
import DmHeader from 'views/direct-message/components/dm-header';
import ThreadChatView from 'views/components/thread-chat-view';
import useTranslation from 'hooks/use-translation';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useLiveDirectMessages from 'hooks/use-live-direct-messages';
import {
    directContactsAtom,
    directMessageAtom,
    keysAtom,
    muteListAtom,
    profilesAtom,
    profileToDmAtom,
    ravenAtom,
    ravenStatusAtom,
    threadRootAtom
} from 'atoms';


const DirectMessagePage = (props: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const {isSm} = useMediaBreakPoint();
    const location = useLocation();
    const [directMessage, setDirectMessage] = useAtom(directMessageAtom);
    const [directContacts] = useAtom(directContactsAtom);
    const [threadRoot, setThreadRoot] = useAtom(threadRootAtom);
    const [ravenStatus] = useAtom(ravenStatusAtom);
    const [muteList] = useAtom(muteListAtom);
    const [raven] = useAtom(ravenAtom);
    const [profiles] = useAtom(profilesAtom);
    const [profileToDm, setProfileToDm] = useAtom(profileToDmAtom);
    const messages = useLiveDirectMessages(directMessage || undefined);
    const [notFound, setNotFound] = useState(false);

    const [npub, pub] = useMemo((): [string | null, string | null] => {
        if ('npub' in props) {
            const npub = props.npub as string;
            try {
                return [npub, nip19.decode(npub).data as string]
            } catch (e) {
            }
        }
        return [null, null];

    }, [props]);

    useEffect(() => {
        if (!npub) navigate('/').then();
    }, [npub]);

    useEffect(() => {
        if (!keys) navigate('/login').then();
    }, [keys]);

    useEffect(() => {
        return () => setProfileToDm(null);
    }, [location]);

    useEffect(() => {
        const c = directContacts.find(x => x.pub === pub);
        setDirectMessage(c?.pub || null);
    }, [pub, directContacts]);

    useEffect(() => {
        const contact = directContacts.find(x => x.pub === pub);
        if (muteList.pubkeys.find(x => x === contact?.pub)) {
            navigate('/').then();
        }
    }, [pub, muteList]);

    useEffect(() => {
        const msg = messages.find(x => x.id === threadRoot?.id);
        if (threadRoot && msg && !isEqual(msg, threadRoot)) {
            setThreadRoot(msg);
        }
    }, [messages, threadRoot]);

    useEffect(() => {
        if (ravenStatus.ready && !directMessage && pub && !profileToDm) {
            const timer = setTimeout(() => setNotFound(true), 5000);

            raven?.fetchProfile(pub).then(profile => {
                if (profile) {
                    setProfileToDm(profile);
                    clearTimeout(timer);
                }
            });

            return () => clearTimeout(timer);
        }
    }, [ravenStatus.ready, directMessage, props, profileToDm]);

    const profile = useMemo(() => profiles.find(x => x.creator === pub), [profiles, pub]);

    if (!npub || !pub || !keys) return null;

    if (!ravenStatus.ready) {
        return <Box sx={{display: 'flex', alignItems: 'center'}}>
            <CircularProgress size={20} sx={{mr: '8px'}}/> {t('Loading...')}
        </Box>;
    }

    if (!directMessage) {
        return <>
            <Helmet><title>{t('AngorChat')}</title></Helmet>
            <AppWrapper>
                <AppMenu/>
                <AppContent>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                    }}>
                        {(() => {
                            if (profileToDm) {
                                return <Box sx={{maxWidth: isSm ? '500px' : '300px', ml: '10px', mr: '10px'}}>
                                    <ProfileCard profile={profileToDm} pub={pub} onDM={() => {
                                    }}/>
                                </Box>
                            }

                            if (notFound) return t('Profile not found');

                            return <>
                                <CircularProgress size={20} sx={{mr: '8px'}}/> {t('Looking for the profile...')}
                            </>;
                        })()}
                    </Box>
                </AppContent>
            </AppWrapper>
        </>
    }

    if (!ravenStatus.dmsDone) {
        return <>
            <Helmet><title>{t(`AngorChat - ${profile?.name || npub}`)}</title></Helmet>
            <AppWrapper>
                <AppMenu/>
                <AppContent>
                    <DmHeader/>
                    <Box sx={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CircularProgress size={20} sx={{mr: '8px'}}/> {t('Fetching messages...')}
                    </Box>
                    <ChatInput separator={pub} senderFn={() => {
                        return new Promise(() => {
                        }).then()
                    }}/>
                </AppContent>
            </AppWrapper>
        </>;
    }

    return <>
        <Helmet><title>{t(`AngorChat - ${profile?.name || npub}`)}</title></Helmet>
        <AppWrapper>
            <AppMenu/>
            <AppContent divide={!!threadRoot}>
                <DmHeader/>
                <ChatView separator={pub} messages={messages} isDM/>
                <ChatInput separator={pub} senderFn={(message: string, mentions: string[]) => {
                    return raven!.sendDirectMessage(pub, message, mentions);
                }}/>
            </AppContent>
            {threadRoot && <ThreadChatView senderFn={(message: string, mentions: string[]) => {
                return raven!.sendDirectMessage(pub, message, mentions, threadRoot.id);
            }}/>}
        </AppWrapper>
    </>;
}

export default DirectMessagePage;
