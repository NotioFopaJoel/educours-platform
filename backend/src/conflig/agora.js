const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
require('dotenv').config();

const generateAgoraToken = (channelName, uid = 0, role = RtcRole.PUBLISHER) => {
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  if (!appID || !appCertificate) {
    throw new Error('Configuration Agora manquante');
  }

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return token;
};

module.exports = { generateAgoraToken };