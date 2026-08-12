class WidgetEngine {
    constructor() {
        this.widgets = {};
        this.state = {};
    }

    register(name, WidgetClass) {
        this.widgets[name] = WidgetClass;
    }

    create(name, config) {
        const WidgetClass = this.widgets[name];
        if (!WidgetClass) {
            throw new Error(`Widget "${name}" not registered`);
        }
        return new WidgetClass(config);
    }

    setState(key, value) {
        this.state[key] = value;
    }

    getState(key) {
        return this.state[key];
    }
}

window.WidgetEngine = new WidgetEngine();
