'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface Course {
	id: string
	name: string
	class: string
	startDate: string
	endDate: string
	progress: number
	totalTasks: number
	completedTasks: number
	color: string
	announcements: Announcement[]
	catalog: CatalogItem[]
	logs: LogItem[]
	members: Member[]
}

interface Announcement {
	id: string
	title: string
	content: string
	date: string
	type: string
}

interface CatalogItem {
	id: string
	title: string
	type: string
	completed: boolean
	dueDate?: string
	date: string
}

interface LogItem {
	id: string
	date: string
	weekday: string
	time: string
	type: string
	title: string
}

interface Member {
	name: string
	role: string
}

interface CourseManagementProps {
	courses: Course[]
	setCourses: (courses: Course[]) => void
}

export default function CourseManagement({ courses, setCourses }: CourseManagementProps) {
	const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courses[0]?.id || null)
	const [selectedSubTab, setSelectedSubTab] = useState<'info' | 'catalog' | 'logs'>('info')

	const selectedCourse = courses.find(c => c.id === selectedCourseId)

	const updateCourse = (updated: Course) => {
		setCourses(courses.map(c => (c.id === updated.id ? updated : c)))
	}

	const addCourse = () => {
		const newCourse: Course = {
			id: `course-${Date.now()}`,
			name: '新课程',
			class: '班级信息',
			startDate: '2026-09-01',
			endDate: '2027-01-15',
			progress: 0,
			totalTasks: 0,
			completedTasks: 0,
			color: '#6366f1',
			announcements: [],
			catalog: [],
			logs: [],
			members: []
		}
		setCourses([...courses, newCourse])
		setSelectedCourseId(newCourse.id)
		toast.success('已添加新课程，记得保存')
	}

	const deleteCourse = (id: string) => {
		if (!confirm('确定要删除这门课程吗？')) return
		setCourses(courses.filter(c => c.id !== id))
		if (selectedCourseId === id) {
			setSelectedCourseId(courses[0]?.id || null)
		}
		toast.success('已删除课程，记得保存')
	}

	const addCatalogItem = () => {
		if (!selectedCourse) return
		const newItem: CatalogItem = {
			id: `cat-${Date.now()}`,
			title: '新的学习项',
			type: '课堂',
			completed: false,
			date: new Date().toISOString().split('T')[0]
		}
		updateCourse({
			...selectedCourse,
			catalog: [...selectedCourse.catalog, newItem]
		})
	}

	const updateCatalogItem = (itemId: string, updates: Partial<CatalogItem>) => {
		if (!selectedCourse) return
		updateCourse({
			...selectedCourse,
			catalog: selectedCourse.catalog.map(item =>
				item.id === itemId ? { ...item, ...updates } : item
			)
		})
	}

	const deleteCatalogItem = (itemId: string) => {
		if (!selectedCourse) return
		updateCourse({
			...selectedCourse,
			catalog: selectedCourse.catalog.filter(item => item.id !== itemId)
		})
	}

	const addLogItem = () => {
		if (!selectedCourse) return
		const today = new Date()
		const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
		const newItem: LogItem = {
			id: `log-${Date.now()}`,
			date: today.toISOString().split('T')[0],
			weekday: weekdays[today.getDay()],
			time: '10:00',
			type: '课堂',
			title: '新的学习记录'
		}
		updateCourse({
			...selectedCourse,
			logs: [...selectedCourse.logs, newItem]
		})
	}

	const updateLogItem = (itemId: string, updates: Partial<LogItem>) => {
		if (!selectedCourse) return
		updateCourse({
			...selectedCourse,
			logs: selectedCourse.logs.map(item =>
				item.id === itemId ? { ...item, ...updates } : item
			)
		})
	}

	const deleteLogItem = (itemId: string) => {
		if (!selectedCourse) return
		updateCourse({
			...selectedCourse,
			logs: selectedCourse.logs.filter(item => item.id !== itemId)
		})
	}

	return (
		<div className='space-y-4'>
			{/* 课程列表 */}
			<div className='rounded-xl bg-gray-50 p-4'>
				<div className='mb-3 flex items-center justify-between'>
					<h3 className='text-sm font-semibold'>课程列表</h3>
					<button
						onClick={addCourse}
						className='rounded-lg bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700'
					>
						+ 添加课程
					</button>
				</div>
				<div className='space-y-2'>
					{courses.map(course => (
						<div
							key={course.id}
							onClick={() => setSelectedCourseId(course.id)}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
								selectedCourseId === course.id
									? 'border-blue-500 bg-blue-50'
									: 'border-gray-200 bg-white hover:border-gray-300'
							}`}
						>
							<div className='flex items-center gap-3'>
								<div
									className='h-8 w-8 rounded-lg'
									style={{ backgroundColor: course.color }}
								/>
								<div>
									<p className='text-sm font-medium'>{course.name}</p>
									<p className='text-xs text-gray-500'>{course.class}</p>
								</div>
							</div>
							<button
								onClick={e => {
									e.stopPropagation()
									deleteCourse(course.id)
								}}
								className='text-xs text-red-500 hover:text-red-700'
							>
								删除
							</button>
						</div>
					))}
				</div>
			</div>

			{/* 课程编辑 */}
			{selectedCourse && (
				<div className='rounded-xl border bg-white p-4'>
					{/* 子 Tab */}
					<div className='mb-4 flex gap-2 border-b'>
						{([
							{ key: 'info', label: '基本信息' },
							{ key: 'catalog', label: `学习目录 (${selectedCourse.catalog.length})` },
							{ key: 'logs', label: `学习日志 (${selectedCourse.logs.length})` }
						] as const).map(tab => (
							<button
								key={tab.key}
								onClick={() => setSelectedSubTab(tab.key)}
								className={`border-b-2 px-3 py-1.5 text-sm transition-colors ${
									selectedSubTab === tab.key
										? 'border-blue-600 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700'
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					{/* 基本信息 */}
					{selectedSubTab === 'info' && (
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='mb-1 block text-xs text-gray-500'>课程名称</label>
								<input
									type='text'
									value={selectedCourse.name}
									onChange={e =>
										updateCourse({ ...selectedCourse, name: e.target.value })
									}
									className='w-full rounded-lg border p-2 text-sm'
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-gray-500'>班级</label>
								<input
									type='text'
									value={selectedCourse.class}
									onChange={e =>
										updateCourse({ ...selectedCourse, class: e.target.value })
									}
									className='w-full rounded-lg border p-2 text-sm'
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-gray-500'>开始日期</label>
								<input
									type='date'
									value={selectedCourse.startDate}
									onChange={e =>
										updateCourse({ ...selectedCourse, startDate: e.target.value })
									}
									className='w-full rounded-lg border p-2 text-sm'
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-gray-500'>结束日期</label>
								<input
									type='date'
									value={selectedCourse.endDate}
									onChange={e =>
										updateCourse({ ...selectedCourse, endDate: e.target.value })
									}
									className='w-full rounded-lg border p-2 text-sm'
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-gray-500'>进度 (%)</label>
								<input
									type='number'
									min='0'
									max='100'
									value={selectedCourse.progress}
									onChange={e =>
										updateCourse({
											...selectedCourse,
											progress: parseInt(e.target.value) || 0
										})
									}
									className='w-full rounded-lg border p-2 text-sm'
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-gray-500'>主题色</label>
								<input
									type='color'
									value={selectedCourse.color}
									onChange={e =>
										updateCourse({ ...selectedCourse, color: e.target.value })
									}
									className='h-9 w-full rounded-lg border'
								/>
							</div>
						</div>
					)}

					{/* 学习目录 */}
					{selectedSubTab === 'catalog' && (
						<div>
							<div className='mb-3 flex items-center justify-between'>
								<h4 className='text-sm font-medium'>学习项列表</h4>
								<button
									onClick={addCatalogItem}
									className='rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700'
								>
									+ 添加学习项
								</button>
							</div>
							<div className='space-y-2'>
								{selectedCourse.catalog.map(item => (
									<div key={item.id} className='rounded-lg border p-3'>
										<div className='flex items-center gap-2'>
											<input
												type='checkbox'
												checked={item.completed}
												onChange={e =>
													updateCatalogItem(item.id, { completed: e.target.checked })
												}
											/>
											<input
												type='text'
												value={item.title}
												onChange={e =>
													updateCatalogItem(item.id, { title: e.target.value })
												}
												className='flex-1 rounded border p-1 text-sm'
											/>
											<select
												value={item.type}
												onChange={e =>
													updateCatalogItem(item.id, { type: e.target.value })
												}
												className='rounded border p-1 text-sm'
											>
												<option value='课堂'>课堂</option>
												<option value='作业'>作业</option>
												<option value='考试'>考试</option>
												<option value='课件'>课件</option>
												<option value='公告'>公告</option>
											</select>
											<button
												onClick={() => deleteCatalogItem(item.id)}
												className='text-xs text-red-500'
											>
												删除
											</button>
										</div>
										{item.type === '作业' || item.type === '考试' ? (
											<div className='mt-2 flex items-center gap-2'>
												<span className='text-xs text-gray-500'>截止日期:</span>
												<input
													type='date'
													value={item.dueDate || ''}
													onChange={e =>
														updateCatalogItem(item.id, { dueDate: e.target.value })
													}
													className='rounded border p-1 text-sm'
												/>
											</div>
										) : null}
									</div>
								))}
							</div>
						</div>
					)}

					{/* 学习日志 */}
					{selectedSubTab === 'logs' && (
						<div>
							<div className='mb-3 flex items-center justify-between'>
								<h4 className='text-sm font-medium'>学习记录列表</h4>
								<button
									onClick={addLogItem}
									className='rounded-lg bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700'
								>
									+ 添加日志
								</button>
							</div>
							<div className='space-y-2'>
								{selectedCourse.logs.map(item => (
									<div key={item.id} className='rounded-lg border p-3'>
										<div className='grid grid-cols-5 gap-2'>
											<input
												type='date'
												value={item.date}
												onChange={e =>
													updateLogItem(item.id, { date: e.target.value })
												}
												className='rounded border p-1 text-sm'
											/>
											<input
												type='text'
												value={item.weekday}
												onChange={e =>
													updateLogItem(item.id, { weekday: e.target.value })
												}
												className='rounded border p-1 text-sm'
												placeholder='星期'
											/>
											<input
												type='time'
												value={item.time}
												onChange={e =>
													updateLogItem(item.id, { time: e.target.value })
												}
												className='rounded border p-1 text-sm'
											/>
											<select
												value={item.type}
												onChange={e =>
													updateLogItem(item.id, { type: e.target.value })
												}
												className='rounded border p-1 text-sm'
											>
												<option value='课堂'>课堂</option>
												<option value='作业'>作业</option>
												<option value='考试'>考试</option>
												<option value='课件'>课件</option>
												<option value='公告'>公告</option>
											</select>
											<button
												onClick={() => deleteLogItem(item.id)}
												className='text-xs text-red-500'
											>
												删除
											</button>
										</div>
										<input
											type='text'
											value={item.title}
											onChange={e =>
												updateLogItem(item.id, { title: e.target.value })
											}
											className='mt-2 w-full rounded border p-1 text-sm'
											placeholder='学习记录标题'
										/>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
