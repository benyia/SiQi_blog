import { toBase64Utf8, getRef, createTree, createCommit, updateRef, createBlob, type TreeItem } from '@/lib/github-client'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'sonner'

export async function pushCourses(coursesData: any): Promise<void> {
	const token = await getAuthToken()

	toast.info('正在获取分支信息...')
	const refData = await getRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`)
	const latestCommitSha = refData.sha

	const commitMessage = `更新课程数据`

	toast.info('正在准备课程数据...')

	const treeItems: TreeItem[] = []

	// 保存 courses.json 文件
	const content = JSON.stringify(coursesData, null, 2)
	const contentBase64 = toBase64Utf8(content)
	const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')

	treeItems.push({
		path: 'src/config/courses.json',
		mode: '100644',
		type: 'blob',
		sha: blobData.sha
	})

	toast.info('正在提交到 GitHub...')
	const tree = await createTree(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, treeItems, latestCommitSha)
	const commit = await createCommit(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, commitMessage, tree.sha, latestCommitSha)
	await updateRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`, commit.sha)

	toast.success('课程数据已保存，等待部署生效...')
}
