var keenProjectId = process.env.OPENSHIFT_KEEP_PROJECT_ID || 'default',
	keenWriteKey = process.env.OPENSHIFT_KEEP_WRITE_KEY || 'default';
	
module.exports = {
	keenProjectId: keenProjectId,
	keenWriteKey: keenWriteKey
};