class AdminApp {
    constructor() {
        if (!localStorage.getItem('authToken')) {
            window.location.href = '/form.html';
            return;
        }       
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        this.uploadedData = null;
        this.init();
    }
    async saveDataToBackend() {
        if (!this.uploadedData) {
            alert('Нет данных для сохранения');
            return;
        }        
        try {
            const uniqueGroups = [...new Set(this.uploadedData.map(s => s.group))];
            const groupPromises = uniqueGroups.map(groupName => 
                apiClient.createGroup({
                    number: groupName,
                    professionId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
                })
            );
            const studentPromises = this.uploadedData.map(student => {
                const nameParts = student.name.split(' ');
                return apiClient.createStudent({
                    name: nameParts[1] || student.name,
                    surname: nameParts[0] || student.name,
                    patronymic: nameParts[2] || '',
                    startYear: new Date().getFullYear(),
                    group: {
                        number: student.group,
                        professionId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
                    },
                    status: 0
                });
            });
            await Promise.all([...groupPromises, ...studentPromises]);
            alert(`Данные успешно сохранены! Студентов: ${this.uploadedData.length}`);            
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка при сохранении данных в бэкенд');
        }
    }
    // ... остальные методы без изменений
}