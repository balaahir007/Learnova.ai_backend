export const generateInviteCode = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let inviteCode = "";
  for (let i = 0; i < length; i++) {
    inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return inviteCode;
};

export const generateStudySpaceLink = (studySpaceName) => {
  const cleanedName = studySpaceName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

    const uniqueSufix = Math.random().toString(36).substring(2,10);
    const convertedName = `${cleanedName}-${uniqueSufix}`;
    return convertedName
};
