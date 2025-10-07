# GoodAction Hub公益慈善活动追踪平台

一个追踪公益慈善会议、竞赛及活动截止日期的网站，帮助公益从业者、志愿者和爱心人士及时了解最新的公益慈善活动动态，不再错过参与公益事业、奉献爱心和社会服务的机会。

## 项目来源

本项目基于 [hust-open-atom-club/open-source-deadlines](https://github.com/hust-open-atom-club/open-source-deadlines) 进行改造开发。原项目是一个优秀的开源活动追踪平台，我们在其基础上进行了以下改进：

- 🎯 **主题转换**：将原有的开源技术活动主题转换为公益慈善活动主题，更好地服务于公益事业
- 🎨 **UI 新增**：对用户界面进行了设计补充
- 📊 **数据适配**：调整了数据结构和内容，使其更适合公益慈善活动的特点

感谢原项目团队的开源贡献，为我们提供了优秀的技术基础和架构设计。

## 如何添加活动

我们非常欢迎社区贡献！如果您发现有未收录的公益慈善会议、竞赛及活动，或者信息有误，请通过提交 Pull Request 的方式来帮助我们更新。

我们会定期查看并处理这些提交，感谢您对公益事业的支持！

所有活动数据都存储在 `/data` 目录下的 YAML 文件中。

- **会议**: 请添加到 `data/conferences.yml`
- **竞赛**: 请添加到 `data/competitions.yml`
- **活动**: 请添加到 `data/activities.yml`

如果您不熟悉 Pull Request 流程，也可以通过Discussions、Issues提交活动链接。

### 数据结构

请在对应的 YAML 文件中，仿照以下格式添加新条目：

```yaml
- title: 活动名称 (例如：第三届老龄志愿与公益服务学术论坛)
  description: 探讨AI时代应对人口老龄化的新策略，推动我国老龄志愿与公益服务事业多元发展
  category: conference # 会议请使用 "conference"，竞赛请使用 "competition"，活动请使用 "activity"
  tags:
    - 老龄服务
    - 志愿公益
    - 人工智能
    - 学术论坛
  events:
    - year: 2025 # 年份
      id: aging-volunteer-forum-2025 # 全局唯一的ID
      link: https://mp.weixin.qq.com/s/qi9gF1ETgk6UvFnnGNSVlg # 链接
      timeline:
        - deadline: '2025-10-19T23:59:00' # 关键日期 (ISO 8601 格式)
          comment: '论文征集截止' # 日期说明
        - deadline: '2025-11-15T09:00:00'
          comment: '学术年会开始'
        - deadline: '2025-11-16T17:00:00'
          comment: '学术年会结束'
      timezone: Asia/Shanghai # 所在时区
      date: 2025年11月15日-11月16日 # 人类可读的日期范围
      place: 中国，北京 # 地点
```

**注意事项:**

- `category`: 必须是 `conference` 、 `competition` 或 `activity`
- `timeline.deadline`: 请使用 ISO 8601 标准格式 - `YYYY-MM-DDTHH:mm:ss`
- `timezone`: 请使用标准的 IANA 时区名称（例如 `Asia/Shanghai`），否则会影响时区转换
- `date`: 请使用人类可读的单个日期或日期范围，如 `2025 年 4 月 30 日` 或 `2025 年 4 月 30 日 - 9 月 30 日`
- `place`: 活动地址，如 `中国，上海`（`国家，城市`）；如果是线上活动，直接写 `线上`

## 开发指南

### 环境准备

**Bun**: 本项目使用 [Bun](https://bun.sh/) 作为包管理器和运行时。

### 本地启动

1. **克隆项目**

    ```bash
    git clone <your-repository-url>
    cd GoodAction-Hub
    ```

2. **安装依赖**

    ```bash
    bun install
    ```

3. **激活 Git Hook（此步骤会在安装依赖后自动执行）**

   ```bash
   bun run prepare
   ```

4. **启动开发服务器**

    ```bash
    bun run dev
    ```

5. **（可选）剪枝**

    ```bash
    bun run knip
    ```

现在，在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可看到项目页面。

### 技术栈

- **框架**: [Next.js](https://nextjs.org/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **搜索**: [Fuse.js](https://github.com/krisk/fuse)
