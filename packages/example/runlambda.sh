bunx remotion lambda sites create --site-name=testbed-v6 --log=verbose --enable-folder-expiry
bunx remotion lambda render testbed-v6 OffthreadRemoteVideo --log=verbose --delete-after="1-day"
