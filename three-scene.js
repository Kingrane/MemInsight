import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class ThreeScene {
    constructor() {
        this.container = document.getElementById('3d-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        
        // Создаем рендерер
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        this.container.appendChild(this.renderer.domElement);

        // Улучшенная настройка освещения
        // Основной рассеянный свет (увеличена интенсивность)
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);

        // Основной направленный свет (как солнце)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(2, 2, 1);
        this.scene.add(mainLight);

        // Дополнительный мягкий свет спереди
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        frontLight.position.set(0, 0, 1);
        this.scene.add(frontLight);

        // Подсветка сзади для объема
        const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
        backLight.position.set(-1, 2, -1);
        this.scene.add(backLight);

        // Дополнительный верхний свет
        const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
        topLight.position.set(0, 3, 0);
        this.scene.add(topLight);


        // Устанавливаем позицию камеры в зависимости от размера экрана
        this.updateCameraPosition();

        // Загружаем модель
        this.loadModel();

        // Привязываем обработчики событий
        this.bindEvents();
        
        // Запускаем анимацию
        this.animate();
    }

    updateCameraPosition() {
        const isMobile = window.innerWidth <= 768;
        
        this.camera.position.z = isMobile ? 20 : 15;
        this.camera.position.x = isMobile ? 0 : -2;
        this.camera.position.y = isMobile ? 0 : 2;
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        loader.load(
            'pepefrog.glb',
            (gltf) => {
                this.object = gltf.scene;
                
                // Настраиваем размер и позицию модели
                const box = new THREE.Box3().setFromObject(this.object);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = (2 / maxDim) * (window.innerWidth <= 768 ? 1 : 1.2);
                this.object.scale.set(scale, scale, scale);

                // Центрируем модель
                box.setFromObject(this.object);
                box.getCenter(this.object.position).multiplyScalar(-1);
                
                // Позиционируем модель в зависимости от размера экрана
                const isMobile = window.innerWidth <= 768;
                this.object.position.z = isMobile ? 15 : 10;
                this.object.position.x = isMobile ? 0 : 4;
                this.object.position.y = isMobile ? 0 : 4;

                // Поворачиваем модель на 90 градусов вправо
                this.object.rotation.y = -Math.PI / 2;

                // Применяем улучшенные материалы для лучшего освещения
                this.object.traverse((child) => {
                    if (child.isMesh) {
                        child.material.roughness = 0.8;
                        child.material.metalness = 0.2;
                    }
                });

                this.scene.add(this.object);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

    bindEvents() {
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            
            // Обновляем позицию при изменении размера окна
            this.updateCameraPosition();
            
            if (this.object) {
                const isMobile = window.innerWidth <= 768;
                this.object.position.z = isMobile ? 15 : 10;
                this.object.position.x = isMobile ? 0 : 4;
                this.object.position.y = isMobile ? 0 : 4;
                
                const scale = (2 / this.object.geometry?.parameters?.radius || 1) * (isMobile ? 1 : 1.2);
                this.object.scale.set(scale, scale, scale);
            }
        });

        // Обработка скролла с очень медленным вращением
        window.addEventListener('scroll', () => {
            if (this.object) {
                const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
                // Замедляем вращение, используя только четверть оборота
                this.object.rotation.y = (-Math.PI / 2) + (scrollPercent * Math.PI * 0.5);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.object) {
            // Добавляем медленное вращение
            this.object.rotation.y += 0.0009;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Создаем экземпляр сцены
const threeScene = new ThreeScene(); 