import { defineStore } from 'pinia';

/**
 * 消息通知状态管理
 */
export const useNoticeStore = defineStore('notice', {
  state: () => ({
    /** 消息通知 */
    notices: [],
    /** 用户私信 */
    letters: [],
    /** 待办事项 */
    todos: []
  }),
  getters: {
    /** 未读数量 */
    unreadNum() {
      return this.notices.length + this.letters.length + this.todos.length;
    }
  },
  actions: {
    /**
     * 设置消息通知数据
     */
    setNotices(data) {
      this.notices = data;
    },
    /**
     * 添加消息通知
     */
    addNotice(item) {
      this.notices.push(item);
    },
    /**
     * 清空消息通知
     */
    clearNotice() {
      this.notices = [];
    },
    /**
     * 设置用户私信数据
     */
    setLetters(data) {
      this.letters = data;
    },
    /**
     * 添加用户私信
     */
    addLetter(item) {
      this.letters.push(item);
    },
    /**
     * 清空用户私信
     */
    clearLetter() {
      this.letters = [];
    },
    /**
     * 设置待办事项数据
     */
    setTodos(data) {
      this.todos = data;
    },
    /**
     * 添加待办事项
     */
    addTodo(item) {
      this.todos.push(item);
    },
    /**
     * 清空待办事项
     */
    clearTodo() {
      this.todos = [];
    }
  }
});
